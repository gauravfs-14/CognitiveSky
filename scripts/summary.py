import os
import json
import hashlib
import datetime
import re
from collections import Counter, defaultdict
from dotenv import load_dotenv
from supabase import create_client
from transformers import pipeline
import libsql_experimental as libsql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from dateutil.parser import isoparse

# === Constants ===
BATCH_SIZE = 500
today = datetime.date.today().isoformat()

# === Load ENV ===
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")
OFFSET = int(os.getenv("BATCH_OFFSET", "0")) * BATCH_SIZE

# === Clients ===
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
sentiment_pipe = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment",
    tokenizer="cardiffnlp/twitter-roberta-base-sentiment",
    device=-1,
    return_all_scores=False
)

emotion_pipe = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    tokenizer="j-hartmann/emotion-english-distilroberta-base",
    top_k=1,
    device=-1,
    return_all_scores=False
)

# === Connect to Turso ===
conn = libsql.connect("/tmp/turso_replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
try:
    conn.execute("SELECT 1")
    print("✅ Database connection successful.")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

conn.execute("""CREATE TABLE IF NOT EXISTS posts (
    uri TEXT PRIMARY KEY,
    did TEXT,
    text TEXT,
    created_at TEXT,
    langs TEXT,
    facets TEXT,
    reply TEXT,
    embed TEXT,
    ingestion_time TEXT,
    sentiment TEXT,
    emotion TEXT,
    topic TEXT
)""")
conn.execute("""CREATE TABLE IF NOT EXISTS topic_summary (
    date TEXT,
    topic TEXT,
    count INTEGER,
    PRIMARY KEY(date, topic)
)""")
conn.execute("""CREATE TABLE IF NOT EXISTS summary_snapshots (
    date TEXT,
    type TEXT,
    scope TEXT,
    hash TEXT,
    data TEXT,
    PRIMARY KEY(date, type, scope)
)""")

# === Helpers ===
def compute_hash(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()

def store_snapshot(type_, scope, data):
    hash_val = compute_hash(data)
    row = conn.execute(
        "SELECT hash FROM summary_snapshots WHERE date=? AND type=? AND scope=?",
        (today, type_, scope)
    ).fetchone()
    if row and row[0] == hash_val:
        print(f"✅ Skipping unchanged {type_}:{scope}")
        return
    conn.execute("""
        INSERT OR REPLACE INTO summary_snapshots (date, type, scope, hash, data)
        VALUES (?, ?, ?, ?, ?)
    """, (today, type_, scope, hash_val, json.dumps(data)))
    print(f"📦 Stored snapshot {type_}:{scope} ({len(data) if isinstance(data, dict) else 'list'})")

def extract_hashtags(text):
    return re.findall(r"#\w+", text)

def extract_emojis(text):
    emoji_pattern = re.compile(
        "["
        u"\U0001F600-\U0001F64F"
        u"\U0001F300-\U0001F5FF"
        u"\U0001F680-\U0001F6FF"
        u"\U0001F1E0-\U0001F1FF"
        u"\u2600-\u26FF"
        u"\U0001F900-\U0001F9FF"
        "]", flags=re.UNICODE)
    return emoji_pattern.findall(text)

def perform_topic_modeling(texts, n_topics=5):
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X = vectorizer.fit_transform(texts)
    nmf = NMF(n_components=n_topics, random_state=42)
    W = nmf.fit_transform(X)
    H = nmf.components_
    topic_words = [
        [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-6:-1]]
        for topic in H
    ]
    topics = ["topic_" + str(topic_id) for topic_id in W.argmax(axis=1)]
    return topics, topic_words, W

def sql_summary(query):
    return {r[0]: r[1] for r in conn.execute(query).fetchall()}

def hardened_label_and_migrate():
    response = supabase.table("posts_unlabeled").select("*").range(OFFSET, OFFSET + BATCH_SIZE - 1).execute()
    posts = response.data or []
    if not posts:
        print("✅ No posts to process.")
        return

    texts = [post.get("text", "")[:512] for post in posts]
    if not any(texts):
        print("⚠️ All texts are empty. Skipping batch.")
        return

    # === Safe Topic Modeling ===
    try:
        topics, topic_words, topic_weights = perform_topic_modeling(texts)
    except Exception as e:
        print(f"⚠️ Topic modeling failed: {e}")
        topics = ["unknown"] * len(posts)
        topic_words, topic_weights = [], [[0]] * len(posts)

    # === Safe NLP Labeling ===
    try:
        sentiments = sentiment_pipe(texts, batch_size=32, truncation=True, padding=True, max_length=512)
    except Exception as e:
        print(f"⚠️ Sentiment labeling failed: {e}")
        sentiments = [{"label": "neutral"}] * len(posts)

    try:
        emotions = emotion_pipe(texts, batch_size=32, truncation=True, padding=True, max_length=512)
    except Exception as e:
        print(f"⚠️ Emotion labeling failed: {e}")
        emotions = [{"label": "neutral"}] * len(posts)

    topic_by_day = defaultdict(Counter)
    sentiment_by_topic = defaultdict(Counter)
    emotion_by_topic = defaultdict(Counter)
    top_posts_by_topic = defaultdict(list)
    hashtags_by_topic = defaultdict(Counter)
    emojis_by_topic = defaultdict(Counter)
    user_by_topic = defaultdict(lambda: defaultdict(int))
    global_hashtags = Counter()
    global_emojis = Counter()
    global_top_posts = []
    global_users = defaultdict(lambda: {"posts": 0})
    posts_by_day = Counter()
    lang_counts = Counter()
    uris_to_delete = []

    for i, post in enumerate(posts):
        try:
            sentiment = sentiments[i]["label"].lower()
            emotion_res = emotions[i][0] if isinstance(emotions[i], list) else emotions[i]
            emotion = emotion_res["label"].lower()
            topic = topics[i]
            score = sum(topic_weights[i]) if i < len(topic_weights) else 0
            created_date = post.get("created_at", today)[:10]
            langs = json.dumps(post.get("langs", []))

            for l in json.loads(langs):
                lang_counts[l] += 1

            conn.execute("""INSERT OR IGNORE INTO posts (
                uri, did, text, created_at, langs, facets, reply, embed, ingestion_time, sentiment, emotion, topic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
                post["uri"], post["did"], post["text"], post["created_at"], langs,
                json.dumps(post.get("facets")), json.dumps(post.get("reply")), json.dumps(post.get("embed")),
                post.get("ingestion_time"), sentiment, emotion, topic
            ))

            conn.execute("INSERT OR REPLACE INTO topic_summary (date, topic, count) VALUES (?, ?, ?)",
                         (created_date, topic, topic_by_day[created_date][topic] + 1))

            topic_by_day[created_date][topic] += 1
            sentiment_by_topic[topic][sentiment] += 1
            emotion_by_topic[topic][emotion] += 1
            hashtags = extract_hashtags(post["text"])
            emojis = extract_emojis(post["text"])
            hashtags_by_topic[topic].update(hashtags)
            emojis_by_topic[topic].update(emojis)
            global_hashtags.update(hashtags)
            global_emojis.update(emojis)
            user_by_topic[topic][post["did"]] += 1
            global_users[post["did"]]["posts"] += 1
            global_top_posts.append({
                "uri": post["uri"], "text": post["text"], "score": score,
                "created_at": post.get("created_at"), "did": post["did"]
            })

            date = isoparse(post.get("created_at", today)).date()
            posts_by_day[str(date)] += 1
            uris_to_delete.append(post["uri"])
        except Exception as e:
            print(f"❌ Error processing post {post.get('uri')}: {e}")

    if uris_to_delete:
        supabase.table("posts_unlabeled").delete().in_("uri", uris_to_delete).execute()

    # === Conditional Snapshot Writing ===
    def safe_store(name, scope, data):
        if isinstance(data, dict) and not data:
            print(f"⚠️ Skipping empty snapshot {name}:{scope}")
        else:
            store_snapshot(name, scope, data)

    safe_store("topics", "keywords", {f"topic_{i}": words for i, words in enumerate(topic_words)})
    safe_store("topics", "distribution_over_time", topic_by_day)
    safe_store("topics", "sentiment_by_topic", sentiment_by_topic)
    safe_store("topics", "emotion_by_topic", emotion_by_topic)
    safe_store("topics", "top_posts", {
        topic: sorted(posts, key=lambda p: p["score"], reverse=True)[:10] for topic, posts in top_posts_by_topic.items()
    })
    safe_store("topics", "hashtags_by_topic", {k: dict(v.most_common(20)) for k, v in hashtags_by_topic.items()})
    safe_store("topics", "emojis_by_topic", {k: dict(v.most_common(20)) for k, v in emojis_by_topic.items()})
    safe_store("topics", "users_by_topic", {k: dict(sorted(v.items(), key=lambda item: item[1], reverse=True)[:10]) for k, v in user_by_topic.items()})
    safe_store("narratives", "overall", sql_summary("SELECT sentiment, COUNT(*) FROM posts GROUP BY sentiment"))
    safe_store("emotions", "overall", sql_summary("SELECT emotion, COUNT(*) FROM posts GROUP BY emotion"))
    safe_store("languages", "overall", dict(lang_counts))
    safe_store("hashtags", "overall", dict(global_hashtags.most_common(100)))
    safe_store("emojis", "overall", dict(global_emojis.most_common(100)))
    safe_store("volume", "timeline", dict(posts_by_day))
    safe_store("posts", "top_by_interaction", sorted(global_top_posts, key=lambda p: p["score"], reverse=True)[:50])

    conn.commit()
    conn.sync()
    print(f"🎉 Labeled and migrated {len(uris_to_delete)} posts with resilient snapshot generation.")


    response = supabase.table("posts_unlabeled").select("*").range(OFFSET, OFFSET + BATCH_SIZE - 1).execute()
    posts = response.data or []
    if not posts:
        print("✅ No posts to process.")
        return

    texts = [post["text"] for post in posts]  # or pre-trim to 1200 chars
    topics, topic_words, topic_weights = perform_topic_modeling(texts)
    # Perform NLP with safe batch + truncation
    sentiments = sentiment_pipe(texts, batch_size=32, truncation=True, padding=True, max_length=512)
    emotions = emotion_pipe(texts, batch_size=32, truncation=True, padding=True, max_length=512)

    topic_by_day = defaultdict(Counter)
    sentiment_by_topic = defaultdict(Counter)
    emotion_by_topic = defaultdict(Counter)
    top_posts_by_topic = defaultdict(list)
    hashtags_by_topic = defaultdict(Counter)
    emojis_by_topic = defaultdict(Counter)
    user_by_topic = defaultdict(lambda: defaultdict(int))

    global_hashtags = Counter()
    global_emojis = Counter()
    global_top_posts = []
    global_users = defaultdict(lambda: {"posts": 0})
    posts_by_day = Counter()
    lang_counts = Counter()
    uris_to_delete = []

    for i, post in enumerate(posts):
        try:
            sentiment = sentiments[i]["label"].lower()
            emotion_res = emotions[i][0] if isinstance(emotions[i], list) else emotions[i]
            emotion = emotion_res["label"].lower()
            topic = topics[i]
            created_date = post.get("created_at", today)[:10]
            score = sum(topic_weights[i])
            langs = json.dumps(post.get("langs", []))

            for l in json.loads(langs):
                lang_counts[l] += 1

            conn.execute("""INSERT OR IGNORE INTO posts (
                uri, did, text, created_at, langs, facets, reply, embed, ingestion_time, sentiment, emotion, topic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
                post["uri"],
                post["did"],
                post["text"],
                post["created_at"],
                langs,
                json.dumps(post.get("facets")),
                json.dumps(post.get("reply")),
                json.dumps(post.get("embed")),
                post.get("ingestion_time"),
                sentiment,
                emotion,
                topic
            ))

            conn.execute("INSERT OR REPLACE INTO topic_summary (date, topic, count) VALUES (?, ?, ?)",
                         (created_date, topic, topic_by_day[created_date][topic] + 1))

            topic_by_day[created_date][topic] += 1
            sentiment_by_topic[topic][sentiment] += 1
            emotion_by_topic[topic][emotion] += 1
            top_posts_by_topic[topic].append({"uri": post["uri"], "text": post["text"], "score": score})
            hashtags = extract_hashtags(post["text"])
            emojis = extract_emojis(post["text"])
            hashtags_by_topic[topic].update(hashtags)
            emojis_by_topic[topic].update(emojis)
            global_hashtags.update(hashtags)
            global_emojis.update(emojis)
            user_by_topic[topic][post["did"]] += 1
            global_users[post["did"]]["posts"] += 1
            global_top_posts.append({
                "uri": post["uri"],
                "text": post["text"],
                "score": score,
                "created_at": post.get("created_at"),
                "did": post["did"]
            })

            date = isoparse(post.get("created_at", today)).date()
            posts_by_day[str(date)] += 1
            uris_to_delete.append(post["uri"])

        except Exception as e:
            print(f"❌ Error processing post {post.get('uri')}: {e}")

    # === Supabase Batch Delete ===
    if uris_to_delete:
        supabase.table("posts_unlabeled").delete().in_("uri", uris_to_delete).execute()

    # === Snapshots ===
    store_snapshot("topics", "keywords", {f"topic_{i}": words for i, words in enumerate(topic_words)})
    store_snapshot("topics", "distribution_over_time", topic_by_day)
    store_snapshot("topics", "sentiment_by_topic", sentiment_by_topic)
    store_snapshot("topics", "emotion_by_topic", emotion_by_topic)
    store_snapshot("topics", "top_posts", {
        topic: sorted(posts, key=lambda p: p["score"], reverse=True)[:10] for topic, posts in top_posts_by_topic.items()
    })
    store_snapshot("topics", "hashtags_by_topic", {k: dict(v.most_common(20)) for k, v in hashtags_by_topic.items()})
    store_snapshot("topics", "emojis_by_topic", {k: dict(v.most_common(20)) for k, v in emojis_by_topic.items()})
    store_snapshot("topics", "users_by_topic", {k: dict(sorted(v.items(), key=lambda item: item[1], reverse=True)[:10]) for k, v in user_by_topic.items()})
    store_snapshot("narratives", "overall", sql_summary("SELECT sentiment, COUNT(*) FROM posts GROUP BY sentiment"))
    store_snapshot("emotions", "overall", sql_summary("SELECT emotion, COUNT(*) FROM posts GROUP BY emotion"))
    store_snapshot("languages", "overall", dict(lang_counts))
    store_snapshot("hashtags", "overall", dict(global_hashtags.most_common(100)))
    store_snapshot("emojis", "overall", dict(global_emojis.most_common(100)))
    store_snapshot("volume", "timeline", dict(posts_by_day))
    store_snapshot("posts", "top_by_interaction", sorted(global_top_posts, key=lambda p: p["score"], reverse=True)[:50])

    conn.commit()
    conn.sync()
    print(f"🎉 Labeled and migrated {len(posts)} posts with full snapshot generation.")

def export_snapshots_to_json():
    print("📤 Exporting historical snapshots to JSON...")
    os.makedirs("summary", exist_ok=True)

    files = {
        "narratives": ["narratives", "emotions", "languages"],
        "hashtags": ["hashtags", "emojis"],
        "activity": ["volume"],
        "engagement": ["posts", "users"],
        "topics": ["topics"]
    }

    grouped_data = {file: {} for file in files}

    rows = conn.execute("SELECT date, type, scope, data FROM summary_snapshots").fetchall()
    for date, type_, scope, data_json in rows:
        for file, types in files.items():
            if type_ in types:
                grouped_data[file].setdefault(date, {}).setdefault(type_, {})[scope] = json.loads(data_json)

    for file, data in grouped_data.items():
        path = f"summary/{file}.json"
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"✅ Wrote {path}")


if __name__ == "__main__":
    os.makedirs("summary", exist_ok=True)
    hardened_label_and_migrate()
    export_snapshots_to_json()
    print("✅ Summary script completed successfully.")

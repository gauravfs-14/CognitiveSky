# === CognitiveSky Full Pipeline: Part 1 ===
print("✅ summary.py is running...")

import os
import json
import hashlib
from datetime import datetime, timedelta, date
import re
from collections import Counter, defaultdict
from dotenv import load_dotenv
from supabase import create_client
import libsql_experimental as libsql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from dateutil.parser import isoparse

# === Constants ===
today = date.today().isoformat()
start_date = (date.today() - timedelta(days=7)).isoformat()  # 7 days before today
end_date = (date.today() - timedelta(days=1)).isoformat()  # yesterday

# === Load ENV ===
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")
IS_TEST = os.getenv("TEST_MODE") == "1"

# Validate required environment variables
if not SUPABASE_URL or not SUPABASE_KEY or not TURSO_DB_URL or not TURSO_DB_TOKEN:
    print("❌ Missing required environment variables. Please set SUPABASE_URL, SUPABASE_KEY, TURSO_DB_URL, and TURSO_DB_TOKEN.")
    exit(1)

# === Clients ===
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# === DB Connection ===
if IS_TEST:
    conn = libsql.connect("test_turso_local.db")
    prod_conn = libsql.connect("/tmp/turso_replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
    try:
        prod_conn.execute("SELECT 1")
        print("✅ Production database connection successful.")
    except Exception as e:
        print(f"❌ Production database connection failed: {e}")
        exit(1)

else:
    conn = libsql.connect("/tmp/turso_replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
try:
    conn.execute("SELECT 1")
    print("✅ Database connection successful.")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    exit(1)

# === Create Tables ===
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

conn.execute("""CREATE TABLE IF NOT EXISTS summary_snapshots (
    date TEXT,
    type TEXT,
    scope TEXT,
    hash TEXT,
    data TEXT,
    PRIMARY KEY(date, type, scope)
)""")

# === Helper Functions ===
def compute_hash(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()

def safe_sync():
    if not IS_TEST:
        conn.sync()

def store_snapshot(type_, scope, data):
    hash_val = compute_hash(data)
    row = conn.execute("SELECT hash FROM summary_snapshots WHERE date=? AND type=? AND scope=?", (end_date, type_, scope)).fetchone()
    if row and row[0] == hash_val:
        print(f"✅ Skipped unchanged {type_}:{scope}")
        return
    conn.execute("INSERT OR REPLACE INTO summary_snapshots VALUES (?, ?, ?, ?, ?)", (end_date, type_, scope, hash_val, json.dumps(data)))
    conn.commit()
    safe_sync()
    print(f"📦 Stored {type_}:{scope}")

if IS_TEST:
    print("🧪 Syncing test DB with production DB...")

    for table in ["posts", "summary_snapshots"]:
        # Fetch from prod
        rows = prod_conn.execute(f"SELECT * FROM {table}").fetchall()
        columns = [d[1] for d in prod_conn.execute(f"PRAGMA table_info({table})").fetchall()]
        if not rows:
            print(f"⚠️ No data found in production `{table}` table.")
            continue
        # Insert into test
        for row in rows:
            placeholders = ", ".join(["?"] * len(row))
            conn.execute(f"INSERT OR IGNORE INTO {table} ({', '.join(columns)}) VALUES ({placeholders})", row)

        print(f"✅ Synced {len(rows)} rows into test `{table}` table.")
    conn.commit()
    safe_sync()

# === Labeling and Model Setup ===
def load_models():
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch

    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    if IS_TEST:
        print("🧪 Test mode: downloading models on the fly...")
        sentiment_id = "cardiffnlp/twitter-roberta-base-sentiment"
        emotion_id = "j-hartmann/emotion-english-distilroberta-base"

        try:
            sent_tok = AutoTokenizer.from_pretrained(sentiment_id)
            sent_model = AutoModelForSequenceClassification.from_pretrained(sentiment_id).to(DEVICE)
            sentiment_labels = [sent_model.config.id2label[i].lower() for i in range(len(sent_model.config.id2label))]
            print("✅ Sentiment model loaded from online (test mode).")
        except Exception as e:
            print(f"❌ Failed to load sentiment model online: {e}")
            exit(1)

        try:
            emot_tok = AutoTokenizer.from_pretrained(emotion_id)
            emot_model = AutoModelForSequenceClassification.from_pretrained(emotion_id).to(DEVICE)
            emotion_labels = [emot_model.config.id2label[i].lower() for i in range(len(emot_model.config.id2label))]
            print("✅ Emotion model loaded from online (test mode).")
        except Exception as e:
            print(f"❌ Failed to load emotion model online: {e}")
            exit(1)
    else:
        hf_home = os.getenv("HF_HOME", os.path.expanduser("~/.hf_models"))
        sent_model_path = os.path.expanduser(os.path.join(hf_home, "sentiment"))
        emot_model_path = os.path.expanduser(os.path.join(hf_home, "emotion"))

        try:
            print("🔄 Loading sentiment model from:", sent_model_path)
            sent_tok = AutoTokenizer.from_pretrained(sent_model_path)
            sent_model = AutoModelForSequenceClassification.from_pretrained(sent_model_path).to(DEVICE)
            sentiment_labels = [sent_model.config.id2label[i].lower() for i in range(len(sent_model.config.id2label))]
            print("✅ Sentiment model loaded from cache.")
        except Exception as e:
            print(f"❌ Failed to load sentiment model from cache: {e}")
            exit(1)

        try:
            print("🔄 Loading emotion model from:", emot_model_path)
            emot_tok = AutoTokenizer.from_pretrained(emot_model_path)
            emot_model = AutoModelForSequenceClassification.from_pretrained(emot_model_path).to(DEVICE)
            emotion_labels = [emot_model.config.id2label[i].lower() for i in range(len(emot_model.config.id2label))]
            print("✅ Emotion model loaded from cache.")
        except Exception as e:
            print(f"❌ Failed to load emotion model from cache: {e}")
            exit(1)

    return sent_tok, sent_model, sentiment_labels, emot_tok, emot_model, emotion_labels, DEVICE

# === Label, Migrate, and Generate Snapshots ===
def hardened_label_and_migrate(sent_tok, sent_model, sentiment_labels, emot_tok, emot_model, emotion_labels, DEVICE):
    import torch
    import torch.nn.functional as F
    
    def fast_infer(texts, tokenizer, model, label_map):
        LABEL_BATCH_SIZE = 64
        results = []
        for i in range(0, len(texts), LABEL_BATCH_SIZE):
            batch = texts[i:i + LABEL_BATCH_SIZE]
            inputs = tokenizer(batch, truncation=True, padding=True, max_length=128, return_tensors="pt").to(DEVICE)
            with torch.no_grad():
                logits = model(**inputs).logits
            probs = F.softmax(logits, dim=-1)
            preds = torch.argmax(probs, dim=-1)
            results.extend([label_map[i.item()] for i in preds])
            del inputs, logits, probs, preds  # Free memory
            torch.cuda.empty_cache() if DEVICE == "cuda" else None
        return results

    print("🚀 Starting labeling and snapshot generation process...")

    # --- Supabase Ingestion ---
    print("🧹 Fetching unlabeled posts from Supabase...")

    start_dt = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"
    end_dt = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z"

    unlabeled_posts = []
    BATCH_SIZE = 1000
    MAX_FETCH = 5000

    for offset in range(0, MAX_FETCH, BATCH_SIZE):
        if IS_TEST:
            print(f"🧪 Test mode: Fetching batch {offset // BATCH_SIZE + 1} of unlabeled posts.")
            batch = supabase.table("posts_unlabeled")\
                     .select("*")\
                        .gte("created_at", start_dt)\
                        .lt("created_at", end_dt)\
                     .range(offset, offset + BATCH_SIZE - 1)\
                     .execute().data or []
        else:  
            batch = supabase.table("posts_unlabeled")\
                .select("*")\
                .gte("created_at", start_dt)\
                .lt("created_at", end_dt)\
                .range(offset, offset + BATCH_SIZE - 1)\
                .execute().data or []

        if not batch:
            break
        unlabeled_posts.extend(batch)
        if len(batch) < BATCH_SIZE:
            break

    if not unlabeled_posts:
        print("⚠️ No new unlabeled posts found in Supabase.")
        return
    print(f"🔍 Found {len(unlabeled_posts)} unlabeled posts for labeling.")
    texts = [post.get("text", "")[:512] for post in unlabeled_posts]
    print(f"🔒 Valid posts with URI: {len(unlabeled_posts)}")

    # --- NLP Labeling ---
    print("🤖 Running sentiment and emotion labeling...")
    try:
        sentiments = fast_infer(texts, sent_tok, sent_model, sentiment_labels)
    except Exception as e:
        print(f"❌ Sentiment labeling failed: {e}")
        sentiments = ["neutral"] * len(texts)

    try:
        emotions = fast_infer(texts, emot_tok, emot_model, emotion_labels)
    except Exception as e:
        print(f"❌ Emotion labeling failed: {e}")
        emotions = ["neutral"] * len(texts)

    # --- Topic Modeling ---
    print("🧠 Performing topic modeling...")
    try:
        vectorizer = TfidfVectorizer(max_features=300, stop_words='english')
        X = vectorizer.fit_transform(texts)
        nmf = NMF(n_components=8, random_state=42)
        W = nmf.fit_transform(X)
        topic_words = [
            [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-6:-1]]
            for topic in nmf.components_
        ]
        topics = [f"topic_{i}" for i in W.argmax(axis=1)]
    except Exception as e:
        print(f"❌ Topic modeling failed: {e}. Assigning 'topic_0' by default.")
        topics = ["topic_0"] * len(texts)
        topic_words = [["general"]] * 8

    # --- Turso Migration ---
    from math import ceil

    print("🧬 Migrating labeled posts to Turso DB (chunked bulk mode)...")

    insert_sql = """
        INSERT OR IGNORE INTO posts (
            uri, did, text, created_at, langs, facets, reply, embed,
            ingestion_time, sentiment, emotion, topic
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    values = []
    for i, post in enumerate(unlabeled_posts):
        try:
            values.append((
                post.get("uri"), post.get("did"), post.get("text"), post.get("created_at"),
                json.dumps(post.get("langs", [])), json.dumps(post.get("facets")),
                json.dumps(post.get("reply")), json.dumps(post.get("embed")),
                post.get("ingestion_time"), sentiments[i], emotions[i], topics[i]
            ))
        except Exception as e:
            print(f"❌ Failed to prepare post {post.get('uri')}: {e}")

    chunk_size = 500
    total = len(values)
    inserted_total = 0

    try:
        for i in range(0, total, chunk_size):
            chunk = values[i:i+chunk_size]
            conn.executemany(insert_sql, chunk)
            inserted_total += len(chunk)
            print(f"✅ Inserted {inserted_total}/{total} posts...", flush=True)
        conn.commit()
        safe_sync()
    except Exception as e:
        print(f"❌ Bulk insert failed at {inserted_total}/{total}: {e}")
        exit(1)

    print(f"✅ Successfully migrated {inserted_total} posts to Turso DB.")

    # --- Supabase Cleanup ---
    try:
        uris = [p["uri"] for p in unlabeled_posts if p.get("uri")]
        if not IS_TEST:
            print("🗑️ Deleting processed posts from Supabase...")
            for i in range(0, len(uris), 100):
                supabase.table("posts_unlabeled").delete().in_("uri", uris[i:i + 100]).execute()
            print("✅ Supabase cleared of migrated posts.")
        else:
            print("🧪 Test mode: Skipped Supabase deletion.")
    except Exception as e:
        print(f"❌ Failed to clean Supabase: {e}")

    # --- Snapshot Generation ---
    print("📊 Generating all snapshot files...")

    if IS_TEST:
        print(f"🧪 Test mode: Analyzing (all posts).")
        rows = conn.execute(
            """
            SELECT created_at, sentiment, emotion, topic, langs, text FROM posts
            WHERE date(created_at) BETWEEN ? AND ?
            """,
            (start_date, end_date)
        ).fetchall()
    else:
        print(f"📅 Analyzing posts from {start_date} to {end_date}...")
        rows = conn.execute(
            """
            SELECT created_at, sentiment, emotion, topic, langs, text FROM posts
            WHERE date(created_at) BETWEEN ? AND ?
            """,
            (start_date, end_date)
        ).fetchall()
    compute_and_store_snapshot(rows, topic_words)

def compute_and_store_snapshot(rows, topic_words=None):
    if topic_words is None:
        topic_words = [["general"]] * 8  # Default topics if not provided
    # === Initialize counters ===
    activity = defaultdict(lambda: {"volume": 0, "sentiment": Counter(), "emotion": Counter(), "language": Counter()})
    hashtags_daily = defaultdict(Counter)
    emojis_daily = defaultdict(Counter)
    emoji_sentiment = defaultdict(Counter)
    hashtag_graph = Counter()
    topic_summary = defaultdict(lambda: {
        "count": 0, "daily": defaultdict(int), "sentiment": Counter(), "emotion": Counter(),
        "hashtags": Counter(), "emojis": Counter()
    })

    emoji_re = re.compile(r"["
        u"\U0001F600-\U0001F64F"
        u"\U0001F300-\U0001F5FF"
        u"\U0001F680-\U0001F6FF"
        u"\u2600-\u26FF"
        u"\U0001F1E0-\U0001F1FF"
        "]", flags=re.UNICODE)
    hashtag_re = re.compile(r"#\w+")

    for created_at, sentiment, emotion, topic, langs_json, text in rows:
        date = isoparse(created_at).date().isoformat()
        langs = json.loads(langs_json or "[]")
        hashtags = hashtag_re.findall(text)
        emojis = emoji_re.findall(text)

        activity[date]["volume"] += 1
        activity[date]["sentiment"][sentiment] += 1
        activity[date]["emotion"][emotion] += 1
        for l in langs:
            activity[date]["language"][l] += 1

        for h in hashtags:
            hashtags_daily[date][h] += 1
        for e in emojis:
            emojis_daily[date][e] += 1
            emoji_sentiment[sentiment][e] += 1

        topic_summary[topic]["count"] += 1
        topic_summary[topic]["daily"][date] += 1
        topic_summary[topic]["sentiment"][sentiment] += 1
        topic_summary[topic]["emotion"][emotion] += 1
        topic_summary[topic]["hashtags"].update(hashtags)
        topic_summary[topic]["emojis"].update(emojis)

        # Hashtag co-occurrence
        for i in range(len(hashtags)):
            for j in range(i + 1, len(hashtags)):
                key = tuple(sorted([hashtags[i], hashtags[j]]))
                hashtag_graph[key] += 1

    # === META STATS ===
    all_posts = conn.execute("SELECT sentiment, emotion, topic, langs, text FROM posts").fetchall()
    all_sent = set()
    all_emot = set()
    all_topics = set()
    all_langs = set()
    all_tags = Counter()
    all_emjs = Counter()

    for sent, emot, topic, langs_json, text in all_posts:
        all_sent.add(sent)
        all_emot.add(emot)
        all_topics.add(topic)
        all_langs.update(json.loads(langs_json or "[]"))
        all_tags.update(hashtag_re.findall(text))
        all_emjs.update(emoji_re.findall(text))

    last_7 = list(activity.values())
    # Add checks to handle empty data in last_7
    if not last_7:
        print("⚠️ No data available for snapshot generation.")
        return

    # Update top calculations to handle empty lists
    store_snapshot("meta", "meta", {
        "date": today,
        "complete": {
            "total_posts": len(all_posts),
            "total_sentiments": len(all_sent),
            "total_emotions": len(all_emot),
            "total_languages": len(all_langs),
            "total_topics": len(all_topics),
            "total_hashtags": len(all_tags),
            "total_emojis": len(all_emjs),
        },
        "last_week": {
            "total_posts": sum(x["volume"] for x in last_7),
            "total_sentiments": len(set(k for x in last_7 for k in x["sentiment"])),
            "total_emotions": len(set(k for x in last_7 for k in x["emotion"])),
            "total_languages": len(set(k for x in last_7 for k in x["language"])),
            "total_topics": len(topic_summary),
            "total_hashtags": len(set(k for d in hashtags_daily.values() for k in d)),
            "total_emojis": len(set(k for d in emojis_daily.values() for k in d)),
        },
        "averages": {
            "avg_posts_per_day": round(sum(x["volume"] for x in last_7) / 7, 2) if last_7 else 0,
            "avg_hashtags_per_day": round(sum(sum(v.values()) for v in hashtags_daily.values()) / 7, 2) if hashtags_daily else 0,
            "avg_emojis_per_day": round(sum(sum(v.values()) for v in emojis_daily.values()) / 7, 2) if emojis_daily else 0,
        },
        "top": {
            "sentiment": Counter(k for x in last_7 for k in x["sentiment"].elements()).most_common(1)[0][0] if last_7 and Counter(k for x in last_7 for k in x["sentiment"].elements()).most_common(1) else None,
            "emotion": Counter(k for x in last_7 for k in x["emotion"].elements()).most_common(1)[0][0] if last_7 and Counter(k for x in last_7 for k in x["emotion"].elements()).most_common(1) else None,
            "language": Counter(k for x in last_7 for k in x["language"].elements()).most_common(1)[0][0] if last_7 and Counter(k for x in last_7 for k in x["language"].elements()).most_common(1) else None,
            "hashtag": all_tags.most_common(1)[0][0] if all_tags.most_common(1) else None,
            "emoji": all_emjs.most_common(1)[0][0] if all_emjs.most_common(1) else None
        }
    })

    store_snapshot("activity", "activity", dict(activity))
    store_snapshot("hashtags", "hashtags", {k: dict(v) for k, v in hashtags_daily.items()})
    store_snapshot("emojis", "emojis", {k: dict(v) for k, v in emojis_daily.items()})

    store_snapshot("emoji_sentiment", "emoji_sentiment", {k: dict(v) for k, v in emoji_sentiment.items()})
    store_snapshot("hashtag_graph", "hashtag_graph", [
        {"source": a, "target": b, "weight": w} for (a, b), w in hashtag_graph.items()
    ])
    store_snapshot("sentiment_by_topic", "sentiment_by_topic", {
        k: dict(v["sentiment"]) for k, v in topic_summary.items()
    })
    store_snapshot("emotion_by_topic", "emotion_by_topic", {
        k: dict(v["emotion"]) for k, v in topic_summary.items()
    })
    store_snapshot("topics", "topics", {
        k: {
            "label": topic_words[int(k.split("_")[1])] if "topic_" in k else ["general"],
            "count": v["count"],
            "daily": dict(v["daily"]),
            "sentiment": dict(v["sentiment"]),
            "emotion": dict(v["emotion"]),
            "hashtags": [h for h, _ in v["hashtags"].most_common(10)],
            "emojis": [e for e, _ in v["emojis"].most_common(10)],
        }
        for k, v in topic_summary.items()
    })

# === Export-only mode ===
def export_snapshots_to_json():
    import collections
    from datetime import date, timedelta

    os.makedirs("summary", exist_ok=True)
    files = {
        "meta": ["meta"],
        "activity": ["activity"],
        "hashtags": ["hashtags"],
        "emojis": ["emojis"],
        "topics": ["topics"],
        "emoji_sentiment": ["emoji_sentiment"],
        "hashtag_graph": ["hashtag_graph"],
        "sentiment_by_topic": ["sentiment_by_topic"],
        "emotion_by_topic": ["emotion_by_topic"]
    }
    data_map = {f: {} for f in files}

    # Fetch all snapshot rows in that range
    if IS_TEST:
        rows = conn.execute(
            "SELECT date, type, scope, data FROM summary_snapshots WHERE date BETWEEN ? AND ?", 
            (start_date, end_date)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT date, type, scope, data FROM summary_snapshots WHERE date BETWEEN ? AND ?", 
            (start_date, end_date)
        ).fetchall()

    # Group raw data by file type, date, and scope
    for date, type_, scope, data_json in rows:
        parsed = json.loads(data_json)

        # Special unwrapping for flat types
        if type_ in ["activity", "hashtags", "emojis", "emoji_sentiment", "emotion_by_topic", "sentiment_by_topic"]:
            # If snapshot is like { "2025-05-28": {...} }, extract inner dict
            if isinstance(parsed, dict) and date in parsed:
                parsed = parsed[date]
            data_map[type_][date] = parsed
        else:
            data_map[type_].setdefault(date, {})[scope] = parsed

    # Helper: remap sentiment labels from model keys to human readable
    sentiment_map = {
        "label_0": "negative",
        "label_1": "neutral",
        "label_2": "positive"
    }

    def remap_sentiments(counter_dict):
        remapped = Counter()
        for k, v in counter_dict.items():
            new_k = sentiment_map.get(k.lower(), k.lower())
            remapped[new_k] += v
        return dict(remapped)

    # --- META JSON ---
    if "meta" in data_map:
        complete = {}
        last_week_post_volumes = []
        last_week_hashtags_counts = []
        last_week_emojis_counts = []

        # For computing tops across last week, collect counters
        top_sentiments = collections.Counter()
        top_emotions = collections.Counter()
        top_languages = collections.Counter()
        top_hashtags = collections.Counter()
        top_emojis = collections.Counter()

        last_week_accum = {
            "total_posts": 0,
            "total_sentiments": set(),
            "total_emotions": set(),
            "total_languages": set(),
            "total_topics": set(),
            "total_hashtags": set(),
            "total_emojis": set(),
        }

        # Accumulate last_week counts from all dates and gather tops
        for date, scopes in data_map["meta"].items():
            meta_data = scopes.get("meta", scopes)

            # Update complete from latest date
            if not complete or date > complete.get("date", ""):
                complete = meta_data.get("complete", {})

            # last_week counts: sum or union sets
            lw = meta_data.get("last_week", {})
            last_week_accum["total_posts"] += lw.get("total_posts", 0)

            last_week_accum["total_sentiments"].update([str(x) for x in lw.get("total_sentiments", [])] if isinstance(lw.get("total_sentiments"), (list, set)) else {lw.get("total_sentiments")})
            last_week_accum["total_emotions"].update([str(x) for x in lw.get("total_emotions", [])] if isinstance(lw.get("total_emotions"), (list, set)) else {lw.get("total_emotions")})
            last_week_accum["total_languages"].update([str(x) for x in lw.get("total_languages", [])] if isinstance(lw.get("total_languages"), (list, set)) else {lw.get("total_languages")})
            last_week_accum["total_topics"].update([str(x) for x in lw.get("total_topics", [])] if isinstance(lw.get("total_topics"), (list, set)) else {lw.get("total_topics")})
            last_week_accum["total_hashtags"].update([str(x) for x in lw.get("total_hashtags", [])] if isinstance(lw.get("total_hashtags"), (list, set)) else {lw.get("total_hashtags")})
            last_week_accum["total_emojis"].update([str(x) for x in lw.get("total_emojis", [])] if isinstance(lw.get("total_emojis"), (list, set)) else {lw.get("total_emojis")})

            # Averages accum
            last_week_post_volumes.append(lw.get("total_posts", 0))
            last_week_hashtags_counts.append(lw.get("total_hashtags", 0))
            last_week_emojis_counts.append(lw.get("total_emojis", 0))

            # Tops accum (top items might be stored under 'top' key in meta)
            top = meta_data.get("top", {})
            if top:
                top_sentiments.update([top.get("sentiment")])
                top_emotions.update([top.get("emotion")])
                top_languages.update([top.get("language")])
                top_hashtags.update([top.get("hashtag")])
                top_emojis.update([top.get("emoji")])

        meta_final = {
            "date": end_date,
            "complete": complete,
            "last_week": {
                "total_posts": last_week_accum["total_posts"],
                "total_sentiments": len(last_week_accum["total_sentiments"]),
                "total_emotions": len(last_week_accum["total_emotions"]),
                "total_languages": len(last_week_accum["total_languages"]),
                "total_topics": len(last_week_accum["total_topics"]),
                "total_hashtags": len(last_week_accum["total_hashtags"]),
                "total_emojis": len(last_week_accum["total_emojis"]),
            },
            "averages": {
                "avg_posts_per_day": round(sum(last_week_post_volumes) / 7, 2) if last_week_post_volumes else 0,
                "avg_hashtags_per_day": round(sum(last_week_hashtags_counts) / 7, 2) if last_week_hashtags_counts else 0,
                "avg_emojis_per_day": round(sum(last_week_emojis_counts) / 7, 2) if last_week_emojis_counts else 0,
            },
            "top": {
                "sentiment": top_sentiments.most_common(1)[0][0] if top_sentiments else None,
                "emotion": top_emotions.most_common(1)[0][0] if top_emotions else None,
                "language": top_languages.most_common(1)[0][0] if top_languages else None,
                "hashtag": top_hashtags.most_common(1)[0][0] if top_hashtags else None,
                "emoji": top_emojis.most_common(1)[0][0] if top_emojis else None,
            }
        }

        data_map["meta"] = meta_final


    # --- ACTIVITY, HASHTAGS, EMOJIS JSON ---
    for key in ["activity", "hashtags", "emojis"]:
        if key in data_map:
            merged = {}
            for date in sorted(data_map[key].keys()):
                daily_data = data_map[key][date]

                # UNWRAP logic: If daily_data is a dict with one key = outer date, unwrap one level
                # Unwrap double nesting: sometimes nested under date then under key ("activity"/"hashtags"/"emojis")
                if isinstance(daily_data, dict) and len(daily_data) == 1:
                    only_key = next(iter(daily_data.keys()))
                    if only_key == date:
                        daily_data = daily_data[only_key]
                        # Check one more level if wrapped under key name (e.g., "activity")
                        if isinstance(daily_data, dict) and len(daily_data) == 1 and key in daily_data:
                            daily_data = daily_data[key]
                    elif only_key == key:
                        # Sometimes just nested once under key, unwrap that too
                        daily_data = daily_data[key]


                # Merge the counters for that date
                if date not in merged:
                    merged[date] = collections.Counter()
                merged[date].update(daily_data)
                if key == "activity":
                    merged[date]["sentiment"] = remap_sentiments(merged[date].get("sentiment", {}))


            # Convert counters back to dict for JSON serialization
            data_map[key] = {d: dict(c) for d, c in merged.items()}

            # DEBUG: print sample for verification
            # print(f"DEBUG [{key}]: Sample keys - {list(data_map[key].keys())[:3]}")
            # for d, counts in list(data_map[key].items())[:1]:
            #     print(f"DEBUG [{key}] Date: {d} Sample data: {dict(list(counts.items())[:5])}")

    # --- TOPIC, EMOJI_SENTIMENT, HASHTAG_GRAPH, SENTIMENT_BY_TOPIC, EMOTION_BY_TOPIC ---

    # Topics: merge counts and lists over days
    if "topics" in data_map:
        merged_topics = {}
        for date in data_map["topics"]:
            if isinstance(data_map["topics"][date], dict) and "topics" in data_map["topics"][date]:
                data_map["topics"][date] = data_map["topics"][date]["topics"]
        for date in sorted(data_map["topics"].keys()):
            for topic, info in data_map["topics"][date].items():
                if topic not in merged_topics:
                    merged_topics[topic] = {
                        "label": info.get("label", []),
                        "count": 0,
                        "daily": {},
                        "sentiment": collections.Counter(),
                        "emotion": collections.Counter(),
                        "hashtags": collections.Counter(),
                        "emojis": collections.Counter(),
                    }
                merged_topics[topic]["count"] += info.get("count", 0)
                for day, val in info.get("daily", {}).items():
                    merged_topics[topic]["daily"][day] = merged_topics[topic]["daily"].get(day, 0) + val
                merged_topics[topic]["sentiment"].update(info.get("sentiment", {}))
                merged_topics[topic]["emotion"].update(info.get("emotion", {}))
                merged_topics[topic]["hashtags"].update(info.get("hashtags", []))
                merged_topics[topic]["emojis"].update(info.get("emojis", []))

        # Finalize structure
        for topic, info in merged_topics.items():
            info["sentiment"] = dict(info["sentiment"])
            info["emotion"] = dict(info["emotion"])
            info["hashtags"] = [h for h, _ in info["hashtags"].most_common(10)]
            info["emojis"] = [e for e, _ in info["emojis"].most_common(10)]

        data_map["topics"] = merged_topics

        # DEBUG: print keys and sample
        # print(f"DEBUG [topics]: Total topics - {len(data_map['topics'])}")
        # sample_topic = next(iter(data_map["topics"].keys()))
        # print(f"DEBUG [topics] Sample topic: {sample_topic} Data: {data_map['topics'][sample_topic]}")


    # Emoji sentiment: merge counters for each sentiment label across days
    if "emoji_sentiment" in data_map:
        merged_emoji_sentiment = collections.defaultdict(collections.Counter)
        for date in data_map["emoji_sentiment"]:
            for sent_label, em_counts in data_map["emoji_sentiment"][date].items():
                remapped_label = sentiment_map.get(sent_label, sent_label)
                merged_emoji_sentiment[remapped_label].update(em_counts)
        # Convert counters to dicts
        for k in merged_emoji_sentiment:
            merged_emoji_sentiment[k] = dict(merged_emoji_sentiment[k])
        data_map["emoji_sentiment"] = dict(merged_emoji_sentiment)

    # Hashtag graph: aggregate edge weights
    if "hashtag_graph" in data_map:
        edge_weights = collections.Counter()
        for date in data_map["hashtag_graph"]:
            edges = data_map["hashtag_graph"][date]
            if isinstance(edges, str):
                edges = json.loads(edges)
            for edge in edges:
                if isinstance(edge, str):
                    continue
                if isinstance(edge, dict) and "source" in edge and "target" in edge:
                    key = (edge["source"], edge["target"])
                    edge_weights[key] += edge.get("weight", 1)
        # Convert back to list of dicts
        merged_edges = [{"source": src, "target": tgt, "weight": w} for (src, tgt), w in edge_weights.items()]
        data_map["hashtag_graph"] = merged_edges

    # sentiment_by_topic & emotion_by_topic: merge topic counts
    for key in ["sentiment_by_topic", "emotion_by_topic"]:
        if key in data_map:
            merged = {}
            for date in data_map[key]:
                for topic, counts in data_map[key][date].items():
                    if topic not in merged:
                        merged[topic] = collections.Counter()
                    merged[topic].update(counts)
            # Convert counters to dict
            for topic in merged:
                merged[topic] = remap_sentiments(merged[topic])
            data_map[key] = merged
    # Unwrap double date nesting for activity, hashtags, emojis
    for key in ["activity", "hashtags", "emojis"]:
        if key in data_map:
            for date in list(data_map[key].keys()):
                val = data_map[key][date]
                if isinstance(val, dict) and len(val) == 1 and date in val:
                    data_map[key][date] = val[date]

    # Finally write JSON files
    for f, data in data_map.items():
        # For topics, DO NOT wrap in a {"topics": ...} dict - dump direct dict
        if f == "topics":
            json_to_dump = data
        else:
            json_to_dump = data

        # Debug print before write
        # print(f"DEBUG Writing file: {f}.json, top-level keys count: {len(json_to_dump) if isinstance(json_to_dump, dict) else 'NA'}")

        with open(f"summary/{f}.json", "w") as out:
            json.dump(json_to_dump, out, indent=2)
        print(f"✅ Wrote summary/{f}.json")

def generate_snapshots_from_turso():
    print("📊 Generating all snapshot files (directly from Turso DB)...")

    # Define date range: last 7 days excluding today
    end_date = (date.today() - timedelta(days=1)).isoformat()  # yesterday
    start_date = (date.today() - timedelta(days=7)).isoformat()  # 7 days before yesterday

    if IS_TEST:
        print(f"📅 Analyzing posts from {start_date} to {end_date}...")

        rows = conn.execute(
            """
            SELECT created_at, sentiment, emotion, topic, langs, text FROM posts
            WHERE date(created_at) BETWEEN ? AND ?
            """,
            (start_date, end_date)
        ).fetchall()
    else:
        print(f"📅 Analyzing posts from {start_date} to {end_date}...")

        rows = conn.execute(
            """
            SELECT created_at, sentiment, emotion, topic, langs, text FROM posts
            WHERE date(created_at) BETWEEN ? AND ?
            """,
            (start_date, end_date)
        ).fetchall()
    
    print(f"🔍 Found {len(rows)} posts in the specified date range.")

    if not rows:
        print("⚠️ No posts found in the specified date range.")
        return
    compute_and_store_snapshot(rows)

# === Entrypoint ===
if __name__ == "__main__":
    os.makedirs("summary", exist_ok=True)

    print("🔄 Starting summary.py...")

    if os.getenv("EXPORT_ONLY") == "1":
        print("🗂️ Exporting snapshots to JSON files...")
        export_snapshots_to_json()
        print("✅ Only exported snapshots.")
    elif os.getenv("SKIP_LABELING") == "1":
        print("🧪 Skipping labeling and generating snapshots from Turso DB...")
        generate_snapshots_from_turso()
        print("✅ Generated snapshots from Turso.")
    else:
        print("🔍 Fetching and labeling posts, then generating snapshots...")
        sent_tok, sent_model, sentiment_labels, emot_tok, emot_model, emotion_labels, DEVICE = load_models()
        hardened_label_and_migrate(sent_tok, sent_model, sentiment_labels, emot_tok, emot_model, emotion_labels, DEVICE)
    conn.commit()
    safe_sync()
import os
import json
from dotenv import load_dotenv
from supabase import create_client
from transformers import pipeline
import libsql_experimental as libsql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

load_dotenv()

# ENV
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TURSO_DB_URL = os.getenv("TURSO_DB_URL")
TURSO_DB_TOKEN = os.getenv("TURSO_DB_TOKEN")

# Clients
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
sentiment_pipe = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
emotion_pipe = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)

# Connect to Turso
conn = libsql.connect("/tmp/replica.db", sync_url=TURSO_DB_URL, auth_token=TURSO_DB_TOKEN)
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

def perform_topic_modeling(texts, n_topics=5):
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    X = vectorizer.fit_transform(texts)
    nmf = NMF(n_components=n_topics, random_state=42)
    W = nmf.fit_transform(X)
    H = nmf.components_
    top_words = [vectorizer.get_feature_names_out()[i] for i in H.argmax(axis=1)]
    topics = [top_words[topic_id] for topic_id in W.argmax(axis=1)]
    return topics

def label_and_migrate():
    print("🔍 Fetching unlabeled posts...")
    response = supabase.table("posts_unlabeled").select("*").limit(1000).execute()
    posts = response.data or []
    all_processed = 0

    if not posts:
        print("✅ No posts to process.")
        return

    texts = [post["text"] for post in posts]
    topics = perform_topic_modeling(texts)

    for i, post in enumerate(posts):
        try:
            text = post["text"]
            sentiment = sentiment_pipe(text)[0]["label"].lower()
            emotion_result = emotion_pipe(text)[0]
            emotion = emotion_result[0]["label"].lower() if isinstance(emotion_result, list) else emotion_result["label"].lower()

            langs = json.dumps(post.get("langs", []))
            facets = json.dumps(post.get("facets"))
            reply = json.dumps(post.get("reply"))
            embed = json.dumps(post.get("embed"))

            conn.execute(
                """INSERT OR IGNORE INTO posts (
                    uri, did, text, created_at, langs, facets, reply, embed, ingestion_time, sentiment, emotion, topic
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    post["uri"],
                    post["did"],
                    text,
                    post["created_at"],
                    langs,
                    facets,
                    reply,
                    embed,
                    post.get("ingestion_time"),
                    sentiment,
                    emotion,
                    topics[i]
                )
            )

            delete_res = supabase.table("posts_unlabeled").delete().eq("uri", post["uri"]).execute()
            if getattr(delete_res, "status_code", 200) >= 300:
                print(f"⚠️ Failed to delete post from Supabase: {post['uri']}")
            else:
                print(f"✅ Labeled + migrated {post['uri']}")
            all_processed += 1

        except Exception as e:
            print(f"❌ Error processing post {post['uri']}: {e}")

    conn.commit()
    conn.sync()
    print(f"🎉 Finished processing. Total posts labeled and migrated: {all_processed}")

if __name__ == "__main__":
    label_and_migrate()

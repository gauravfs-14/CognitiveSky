import os
from supabase import create_client
from libsql_client import create_client as create_turso_client
from dotenv import load_dotenv
from transformers import pipeline

# Load environment
load_dotenv()
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
turso = create_turso_client(url=os.environ["TURSO_DB_URL"])

# Sentiment pipeline
sentiment_pipe = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment")
emotion_pipe = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)

# Fetch unlabeled posts
response = supabase.table("posts_unlabeled").select("*").limit(100).execute()
posts = response.data
if not posts:
    print("No posts to label.")
    exit()

print(f"🔄 Labeling {len(posts)} posts...")

for post in posts:
    try:
        text = post["text"]

        # Sentiment
        sentiment_label = sentiment_pipe(text)[0]["label"].lower()  # pos/neg/neutral
        post["sentiment"] = sentiment_label

        # Emotion
        emotion_label = emotion_pipe(text)[0]["label"].lower()  # joy/sadness/etc
        post["emotion"] = emotion_label

        # Insert into Turso
        turso.execute(
            """INSERT OR IGNORE INTO posts (
                uri, did, text, created_at, langs, facets, reply, embed, ingestion_time,
                sentiment, emotion
            ) VALUES (
                :uri, :did, :text, :created_at, :langs, :facets, :reply, :embed, :ingestion_time,
                :sentiment, :emotion
            )""",
            params=post
        )

        # Delete from Supabase
        supabase.table("posts_unlabeled").delete().eq("uri", post["uri"]).execute()

        print(f"✅ Labeled + migrated {post['uri']}")

    except Exception as e:
        print(f"❌ Failed to process {post['uri']}: {e}")

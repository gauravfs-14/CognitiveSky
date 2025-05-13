import pandas as pd
from transformers import pipeline
import os
import json
from tqdm import tqdm

def analyze_sentiment_and_emotion(input_file, output_path="./data/clean_posts_with_sentiment.json"):
    # Load cleaned posts
    df = pd.read_json(input_file)

    # Load models with truncation settings
    print("🔍 Loading models...")
    sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment", truncation=True)
    emotion_pipeline = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1, truncation=True)

    # Add new columns
    sentiments = []
    emotions = []

    print("🔄 Analyzing posts...")
    for _, row in tqdm(df.iterrows(), total=len(df)):
        text = row["text"]
        try:
            sentiment = sentiment_pipeline(text)[0]
            emotion = emotion_pipeline(text)[0][0]

            sentiments.append(sentiment["label"].lower())
            emotions.append(emotion["label"].lower())

        except Exception as e:
            print(f"⚠️ Skipping post {row['postId'][:30]}...: {e}")
            sentiments.append(None)
            emotions.append(None)

    # Merge results into dataframe
    df["sentiment"] = sentiments
    df["emotion"] = emotions

    # Save merged results
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_json(output_path, orient="records", indent=2)
    print(f"✅ All done! Saved enriched dataset to {output_path}")

# Example usage
if __name__ == "__main__":
    analyze_sentiment_and_emotion("./data/clean_posts.json", "./data/clean_posts_with_sentiment.json")

import pandas as pd
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import torch
import os
import json
from tqdm import tqdm

def analyze_sentiment_and_emotion(input_file, output_path="./data/clean_posts_with_sentiment.json"):
    # Load data
    df = pd.read_json(input_file)

    # Setup models manually to control truncation and avoid tensor errors
    print("🔍 Loading sentiment model...")
    sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
    sentiment_model = AutoModelForSequenceClassification.from_pretrained(sentiment_model_name)
    sentiment_tokenizer = AutoTokenizer.from_pretrained(sentiment_model_name)

    sentiment_pipeline = pipeline(
        "sentiment-analysis",
        model=sentiment_model,
        tokenizer=sentiment_tokenizer,
        device=0 if torch.cuda.is_available() else -1,
        truncation=True,
        padding=True,
        max_length=512
    )

    print("🔍 Loading emotion model...")
    emotion_model_name = "j-hartmann/emotion-english-distilroberta-base"
    emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model_name)
    emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model_name)

    emotion_pipeline = pipeline(
        "text-classification",
        model=emotion_model,
        tokenizer=emotion_tokenizer,
        top_k=1,
        device=0 if torch.cuda.is_available() else -1,
        truncation=True,
        padding=True,
        max_length=512
    )

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

    df["sentiment"] = sentiments
    df["emotion"] = emotions

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_json(output_path, orient="records", indent=2)
    print(f"✅ Saved merged data to {output_path}")

# Run this script
if __name__ == "__main__":
    analyze_sentiment_and_emotion("./data/clean_posts.json", "./data/clean_posts_with_sentiment.json")

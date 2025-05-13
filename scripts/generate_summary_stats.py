import pandas as pd
import json
import os

def generate_summary_stats(input_file="./data/clean_posts_with_sentiment.json", output_dir="./data"):
    df = pd.read_json(input_file)

    # === Base summary
    summary = {
        "total_posts": len(df),
        "has_sentiment": int("sentiment" in df.columns and df["sentiment"].notna().sum()),
        "has_emotion": int("emotion" in df.columns and df["emotion"].notna().sum()),
        "has_topic": int("topic" in df.columns and df["topic"].notna().sum())
    }

    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    # === Sentiment
    if "sentiment" in df.columns:
        sentiment_counts = df["sentiment"].value_counts(dropna=True).to_dict()
        sentiment_total = sum(sentiment_counts.values())
        sentiment_stats = [
            {
                "label": sentiment,
                "count": count,
                "percent": round(100 * count / sentiment_total, 2)
            }
            for sentiment, count in sentiment_counts.items()
        ]
        with open(os.path.join(output_dir, "sentiment_counts.json"), "w") as f:
            json.dump(sentiment_stats, f, indent=2)

    # === Emotion
    if "emotion" in df.columns:
        emotion_counts = df["emotion"].value_counts(dropna=True).to_dict()
        emotion_stats = [
            {"label": label, "count": count}
            for label, count in emotion_counts.items()
        ]
        with open(os.path.join(output_dir, "emotion_counts.json"), "w") as f:
            json.dump(emotion_stats, f, indent=2)

    # === Topic
    if "topic" in df.columns:
        topic_counts = df["topic"].value_counts(dropna=True).sort_index().to_dict()
        topic_stats = [{"topic": int(k), "count": v} for k, v in topic_counts.items()]
        with open(os.path.join(output_dir, "topic_counts.json"), "w") as f:
            json.dump(topic_stats, f, indent=2)

    print("✅ Dashboard summary files saved to", output_dir)

if __name__ == "__main__":
    generate_summary_stats()

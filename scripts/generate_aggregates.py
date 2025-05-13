import pandas as pd
import re
from collections import Counter
from datetime import datetime
import emoji
import json
import os

def extract_hashtags(text):
    return re.findall(r"#\w+", text)

def extract_emojis(text):
    return [char for char in text if char in emoji.EMOJI_DATA]

def format_date(date_str):
    try:
        return datetime.fromisoformat(date_str.replace("Z", "")).date().isoformat()
    except:
        return None

def generate_aggregates(input_file, output_dir="./data"):
    # Load cleaned data
    df = pd.read_json(input_file)

    # ========== Timeline ==========
    df["date"] = df["createdAt"].apply(format_date)
    timeline = df.groupby("date").size().reset_index(name="count")
    timeline.to_json(os.path.join(output_dir, "timeline.json"), orient="records")

    # ========== Hashtags ==========
    all_hashtags = []
    for text in df["text"]:
        all_hashtags.extend(extract_hashtags(text))
    top_hashtags = Counter(all_hashtags).most_common(50)
    hashtags_df = pd.DataFrame(top_hashtags, columns=["hashtag", "count"])
    hashtags_df.to_json(os.path.join(output_dir, "hashtags.json"), orient="records")

    # ========== Emojis ==========
    all_emojis = []
    for text in df["text"]:
        all_emojis.extend(extract_emojis(text))
    top_emojis = Counter(all_emojis).most_common(50)
    emojis_df = pd.DataFrame(top_emojis, columns=["emoji", "count"])
    emojis_df.to_json(os.path.join(output_dir, "emojis.json"), orient="records")

    # ========== Languages ==========
    lang_counts = df["lang"].value_counts().reset_index()
    lang_counts.columns = ["lang", "count"]
    lang_counts.to_json(os.path.join(output_dir, "languages.json"), orient="records")

    # ========== Top Users ==========
    user_counts = df["authorDid"].value_counts().reset_index()
    user_counts.columns = ["authorDid", "count"]
    user_counts.to_json(os.path.join(output_dir, "top_users.json"), orient="records")

    print("✅ Aggregates generated and saved in:", output_dir)

# Example usage
if __name__ == "__main__":
    generate_aggregates("./data/clean_posts.json", "./data")

import pandas as pd
import json

def merge_topic_info(posts_path="./data/clean_posts_with_sentiment.json",
                     semantic_path="./data/semantic_map.json",
                     output_path="./data/clean_posts_full.json"):
    posts = pd.read_json(posts_path)
    with open(semantic_path) as f:
        semantic = json.load(f)

    semantic_df = pd.DataFrame(semantic)[["postId", "topic", "x", "y"]]
    merged = posts.merge(semantic_df, on="postId", how="left")

    merged.to_json(output_path, orient="records", indent=2)
    print(f"✅ Merged semantic data into: {output_path}")

if __name__ == "__main__":
    merge_topic_info()

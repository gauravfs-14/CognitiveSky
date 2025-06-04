import os
import json
import sys
from typing import Dict, List
from pydantic import BaseModel, ValidationError, RootModel

# === SCHEMAS ===

class MetaCounts(BaseModel):
    total_posts: int
    total_sentiments: int
    total_emotions: int
    total_languages: int
    total_topics: int
    total_hashtags: int
    total_emojis: int

class MetaAverages(BaseModel):
    avg_posts_per_day: float
    avg_hashtags_per_day: float
    avg_emojis_per_day: float

class MetaTop(BaseModel):
    sentiment: str
    emotion: str
    language: str
    hashtag: str
    emoji: str

class MetaSummary(BaseModel):
    date: str
    complete: MetaCounts
    last_week: MetaCounts
    averages: MetaAverages
    top: MetaTop

class DailyActivity(BaseModel):
    volume: int
    sentiment: Dict[str, int]
    emotion: Dict[str, int]
    language: Dict[str, int]

ActivityWrapper = RootModel[Dict[str, DailyActivity]]
TagsWrapper = RootModel[Dict[str, Dict[str, int]]]
EmojiSentimentWrapper = RootModel[Dict[str, Dict[str, int]]]
HashtagGraphWrapper = RootModel[List[Dict[str, str | int]]]
TopicSentimentWrapper = RootModel[Dict[str, Dict[str, int]]]

class TopicSummary(BaseModel):
    label: List[str]
    count: int
    daily: Dict[str, int]
    sentiment: Dict[str, int]
    emotion: Dict[str, int]
    hashtags: List[str]
    emojis: List[str]

TopicsWrapper = RootModel[Dict[str, TopicSummary]]

# === FILE SCHEMA MAP ===

schema_map = {
    "meta.json": MetaSummary,
    "activity.json": ActivityWrapper,
    "hashtags.json": TagsWrapper,
    "emojis.json": TagsWrapper,
    "emoji_sentiment.json": EmojiSentimentWrapper,
    "hashtag_graph.json": HashtagGraphWrapper,
    "sentiment_by_topic.json": TopicSentimentWrapper,
    "emotion_by_topic.json": TopicSentimentWrapper,
    "topics.json": TopicsWrapper,
}

def validate_file(filepath, model_class):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        model_class.model_validate(data)
        print(f"✅ {os.path.basename(filepath)} passed validation.")
    except ValidationError as e:
        print(f"❌ {os.path.basename(filepath)} failed validation:")
        for err in e.errors():
            print(f"   - {'.'.join(map(str, err['loc']))}: {err['msg']}")
    except Exception as e:
        print(f"❌ {os.path.basename(filepath)}: Failed to load or parse JSON: {e}")

def validate_summary_folder(folder_path):
    if not os.path.exists(folder_path):
        print(f"❌ Folder not found: {folder_path}")
        return

    files = os.listdir(folder_path)
    for filename in sorted(files):
        if filename in schema_map:
            filepath = os.path.join(folder_path, filename)
            if os.path.isfile(filepath):
                validate_file(filepath, schema_map[filename])
        else:
            print(f"🟡 Skipping {filename} (no schema defined)")

# === RUN ===

if __name__ == "__main__":
    folder_arg = sys.argv[1] if len(sys.argv) > 1 else "summary"
    print(f"\n📁 Validating summary files in: {folder_arg}\n")
    validate_summary_folder(folder_arg)

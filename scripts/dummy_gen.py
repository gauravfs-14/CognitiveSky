import json
import datetime
import random
import os

def random_choice_weighted(choices):
    items, weights = zip(*choices.items())
    return random.choices(items, weights=weights)[0]

def generate_dummy_json_files(output_dir="summary", days=7):
    os.makedirs(output_dir, exist_ok=True)
    today = datetime.date.today()
    dates = [(today - datetime.timedelta(days=i)).isoformat() for i in reversed(range(days))]

    sentiments = {"positive": 0.3, "neutral": 0.5, "negative": 0.2}
    emotions = {"joy": 0.3, "sadness": 0.1, "fear": 0.1, "neutral": 0.5}
    languages = {"english": 0.7, "spanish": 0.2, "french": 0.1}
    hashtags = ["#MentalHealth", "#YouMatter", "#Healing", "#Support", "#YouAreNotAlone"]
    emojis = ["😊", "🙏", "💔", "😢", "🙂"]
    topics = {
        "topic_0": ["mental", "health", "support", "talk", "wellness"],
        "topic_1": ["therapy", "anxiety", "stress", "help", "mind"],
        "topic_2": ["depression", "hope", "recovery", "life", "healing"],
    }

    # meta.json
    meta = {
        "date": today.isoformat(),
        "complete": {
            "total_posts": 15000,
            "total_sentiments": len(sentiments),
            "total_emotions": len(emotions),
            "total_languages": len(languages),
            "total_topics": len(topics),
            "total_hashtags": len(hashtags),
            "total_emojis": len(emojis),
        },
        "last_week": {
            "total_posts": 1400,
            "total_sentiments": len(sentiments),
            "total_emotions": len(emotions),
            "total_languages": len(languages),
            "total_topics": len(topics),
            "total_hashtags": 12,
            "total_emojis": 7,
        },
        "averages": {
            "avg_posts_per_day": 200,
            "avg_hashtags_per_day": 15,
            "avg_emojis_per_day": 10
        },
        "top": {
            "sentiment": "neutral",
            "emotion": "joy",
            "language": "english",
            "hashtag": "#MentalHealth",
            "emoji": "😊"
        }
    }
    with open(f"{output_dir}/meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    # activity.json
    activity = {}
    for d in dates:
        sentiment_counts = {k: random.randint(10, 100) for k in sentiments}
        emotion_counts = {k: random.randint(10, 100) for k in emotions}
        language_counts = {k: random.randint(10, 100) for k in languages}
        volume = sum(sentiment_counts.values())
        activity[d] = {
            "volume": volume,
            "sentiment": sentiment_counts,
            "emotion": emotion_counts,
            "language": language_counts,
        }
    with open(f"{output_dir}/activity.json", "w") as f:
        json.dump(activity, f, indent=2)

    # hashtags.json
    hashtags_daily = {}
    for d in dates:
        counts = {tag: random.randint(0, 30) for tag in hashtags}
        hashtags_daily[d] = {k: v for k, v in counts.items() if v > 0}
    with open(f"{output_dir}/hashtags.json", "w") as f:
        json.dump(hashtags_daily, f, indent=2)

    # emojis.json
    emojis_daily = {}
    for d in dates:
        counts = {em: random.randint(0, 30) for em in emojis}
        emojis_daily[d] = {k: v for k, v in counts.items() if v > 0}
    with open(f"{output_dir}/emojis.json", "w") as f:
        json.dump(emojis_daily, f, indent=2)

    # topics.json
    topics_json = {}
    for topic, labels in topics.items():
        count = random.randint(10, 100)
        daily = {d: random.randint(0, 20) for d in dates}
        sentiment = {k: random.randint(0, 50) for k in sentiments}
        emotion = {k: random.randint(0, 50) for k in emotions}
        hashtags_list = random.sample(hashtags, k=3)
        emojis_list = random.sample(emojis, k=3)
        topics_json[topic] = {
            "label": labels,
            "count": count,
            "daily": {k: v for k, v in daily.items() if v > 0},
            "sentiment": sentiment,
            "emotion": emotion,
            "hashtags": hashtags_list,
            "emojis": emojis_list,
        }
    with open(f"{output_dir}/topics.json", "w") as f:
        json.dump(topics_json, f, indent=2)

    # emoji_sentiment.json
    emoji_sentiment = {
        "positive": {emojis[0]: 100, emojis[1]: 80},
        "negative": {emojis[2]: 70, emojis[3]: 50},
        "neutral": {emojis[4]: 40}
    }
    with open(f"{output_dir}/emoji_sentiment.json", "w") as f:
        json.dump(emoji_sentiment, f, indent=2)

    # hashtag_graph.json
    hashtag_graph = [
        {"source": "#MentalHealth", "target": "#Healing", "weight": 20},
        {"source": "#Support", "target": "#YouMatter", "weight": 15}
    ]
    with open(f"{output_dir}/hashtag_graph.json", "w") as f:
        json.dump(hashtag_graph, f, indent=2)

    # sentiment_by_topic.json
    sentiment_by_topic = {}
    for topic in topics:
        sentiment_by_topic[topic] = {k: random.randint(10, 100) for k in sentiments}
    with open(f"{output_dir}/sentiment_by_topic.json", "w") as f:
        json.dump(sentiment_by_topic, f, indent=2)

    # emotion_by_topic.json
    emotion_by_topic = {}
    for topic in topics:
        emotion_by_topic[topic] = {k: random.randint(10, 100) for k in emotions}
    with open(f"{output_dir}/emotion_by_topic.json", "w") as f:
        json.dump(emotion_by_topic, f, indent=2)

if __name__ == "__main__":
    generate_dummy_json_files()

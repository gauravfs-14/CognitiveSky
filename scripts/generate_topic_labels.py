import json
import os

def generate_topic_labels(topic_keywords_path, output_path="./data/topic_labels.json"):
    # Load top keywords per topic
    with open(topic_keywords_path, "r") as f:
        topic_keywords = json.load(f)

    topic_labels = {}
    for topic_id, keywords in topic_keywords.items():
        if not keywords:
            label = f"Topic {topic_id}"
        else:
            # Simple rule: use top 2 keywords for a label
            label = f"{keywords[0].capitalize()} & {keywords[1]}" if len(keywords) > 1 else keywords[0].capitalize()

        topic_labels[topic_id] = {
            "label": label,
            "keywords": keywords
        }

    # Save human-readable labels
    with open(output_path, "w") as f:
        json.dump(topic_labels, f, indent=2)

    print(f"✅ Saved topic_labels.json to: {output_path}")

# Run this script
if __name__ == "__main__":
    generate_topic_labels("./data/topics.json", "./data/topic_labels.json")

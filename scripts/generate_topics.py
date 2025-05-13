import os
os.environ["NUMBA_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
import umap
import json
from tqdm import tqdm
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def generate_topics(input_file, output_dir="./data", n_topics=10):
    df = pd.read_json(input_file)

    print("🧠 Loading Sentence-BERT model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")  # fast and compact

    print("🔄 Generating embeddings...")
    embeddings = model.encode(df["text"].tolist(), show_progress_bar=True)

    print("📉 Reducing dimensions with UMAP (thread-safe)...")
    reducer = umap.UMAP(n_neighbors=15, n_components=2, metric='cosine', verbose=True)
    reduced = reducer.fit_transform(embeddings)

    print(f"📊 Clustering into {n_topics} topics...")
    kmeans = KMeans(n_clusters=n_topics, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(embeddings)

    df["topic"] = labels
    df["x"] = reduced[:, 0]
    df["y"] = reduced[:, 1]

    # === Save semantic map
    semantic_map = df[["postId", "text", "x", "y", "topic"]].to_dict(orient="records")
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "semantic_map.json"), "w") as f:
        json.dump(semantic_map, f, indent=2)

    # === Extract top keywords per topic
    print("🔍 Extracting top keywords per topic using TF-IDF...")
    tfidf = TfidfVectorizer(stop_words='english', max_features=10000)
    tfidf_matrix = tfidf.fit_transform(df["text"])
    terms = tfidf.get_feature_names_out()

    topic_keywords = {}
    for i in range(n_topics):
        topic_indices = np.where(labels == i)[0]
        mean_tfidf = tfidf_matrix[topic_indices].mean(axis=0).A1
        top_term_indices = mean_tfidf.argsort()[::-1][:10]
        topic_keywords[i] = [terms[j] for j in top_term_indices]

    with open(os.path.join(output_dir, "topics.json"), "w") as f:
        json.dump(topic_keywords, f, indent=2)

    print(f"✅ Saved topic map and keywords to: {output_dir}")

# Run this
if __name__ == "__main__":
    generate_topics("./data/clean_posts_with_sentiment.json", "./data", n_topics=10)

import pandas as pd
import json
import networkx as nx
import os
from collections import defaultdict
from community import community_louvain  # pip install python-louvain

def extract_mentions(text):
    # Optional: extract @mentions (Bluesky-style) if applicable
    return []

def generate_user_network(input_file="./data/clean_posts_with_sentiment.json", output_dir="./data"):
    df = pd.read_json(input_file)

    G = nx.Graph()
    interactions = []

    print("🔗 Building graph from replyParentUri...")

    for _, row in df.iterrows():
        source = row["authorDid"]
        reply_uri = row.get("replyParentUri")

        # Try to extract mentioned user (if reply)
        if pd.notna(reply_uri) and "did:plc:" in reply_uri:
            try:
                target = reply_uri.split("/")[2]
                G.add_edge(source, target)
                interactions.append((source, target))
            except:
                continue

        # Optional: text-based mentions
        for mention in extract_mentions(row["text"]):
            if mention != source:
                G.add_edge(source, mention)
                interactions.append((source, mention))

    print(f"👥 Total users in graph: {G.number_of_nodes()}, edges: {G.number_of_edges()}")

    # === Louvain Community Detection
    print("🧠 Detecting user communities...")
    partition = community_louvain.best_partition(G)
    nx.set_node_attributes(G, partition, "community")

    # === Nodes
    node_data = []
    user_post_counts = df["authorDid"].value_counts().to_dict()
    for node in G.nodes():
        node_data.append({
            "id": node,
            "group": partition.get(node, -1),
            "posts": user_post_counts.get(node, 0)
        })

    # === Edges
    edge_data = [{"source": u, "target": v} for u, v in G.edges()]

    # === Community summary
    community_summary = defaultdict(list)
    for user, group in partition.items():
        community_summary[group].append(user)

    community_stats = [{"community": k, "size": len(v)} for k, v in community_summary.items()]

    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, "graph_nodes.json"), "w") as f:
        json.dump(node_data, f, indent=2)
    with open(os.path.join(output_dir, "graph_edges.json"), "w") as f:
        json.dump(edge_data, f, indent=2)
    with open(os.path.join(output_dir, "communities.json"), "w") as f:
        json.dump(community_stats, f, indent=2)

    print(f"✅ User network saved to: {output_dir}")

if __name__ == "__main__":
    generate_user_network()

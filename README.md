# 🧠 CognitiveSky

**CognitiveSky** is an open-source research tool designed to explore and analyze mental health narratives in public Bluesky data. Inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer), this dashboard enables researchers, analysts, and public health advocates to gain insights from social discourse using NLP, sentiment analysis, topic modeling, and interactive visualizations.

---

## 🚀 Features

### 📊 Interactive Dashboard

- Filter posts by **date**, **keyword**, **language**, **country**, **sentiment**, and **narrative category**
- Explore trends in:
  - Post frequency over time
  - Sentiment and emotion shifts
  - Most used hashtags, emojis, and keywords
  - Top posts and user activity

### 🧠 Topic & Narrative Exploration

- Semantic mapping of posts using **Sentence-BERT + UMAP**
- Interactive topic clusters with word clouds
- Claim search to identify related narratives in semantic space
- Mental health categories like `therapy`, `burnout`, `trauma`, etc.

### 👥 Social Network Analysis _(optional)_

- User community graphs from repost/mention relationships
- Community detection via **Louvain algorithm**
- Stats per community (tweet volume, sentiment, top users)

### 📄 Reporting & Export

- Generate summarized narrative reports
- Export filtered data as JSON or CSV
- Download visuals (charts, maps, clouds)

---

## 🧱 Project Structure

```
cognitivesky/
├── data/                  # Preprocessed JSON datasets
│   ├── bluesky_posts.db   # SQLite database with raw posts
│   ├── clean_posts.json   # Cleaned post data
│   ├── communities.json   # Community detection results
│   ├── emojis.json        # Emoji usage data
│   ├── emotion_counts.json # Emotion analysis results
│   ├── semantic_map.json  # UMAP dimensionality reduction
│   ├── sentiment_counts.json # Sentiment analysis results
│   └── topics.json        # Topic modeling results
├── scripts/               # Python preprocessing scripts
│   ├── analyze_sentiment_emotion.py # Sentiment & emotion analysis
│   ├── extract_clean_posts.py # Data extraction from DB
│   ├── generate_aggregates.py # Statistical aggregations
│   ├── generate_topics.py # Generates topic embeddings
│   ├── generate_user_networks.py # Community detection
│   └── merge_semantic_topics.py # Final data integration
├── prepare_data.sh        # Data pipeline execution script
├── environment.yml        # Python dependencies
├── dashboard/             # Next.js web application
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Main dashboard page
│   │   ├── topics/        # Topic exploration routes
│   │   ├── sentiment/     # Sentiment analysis routes
│   │   ├── posts/         # Post browsing routes
│   │   ├── export/        # Data export functionality
│   │   └── timeline/      # Timeline visualization
│   ├── components/        # React components
│   │   ├── charts/        # Visualization components
│   │   ├── ui/            # UI components
│   │   └── ...
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks for data
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/gauravfs-14/cognitivesky.git
cd cognitivesky
```

### 2. Set Up Python Environment

```bash
# Create and activate conda environment
conda env create -f environment.yml
conda activate cognitivesky
```

### 3. Process Your Data

```bash
# Run the data preprocessing pipeline
bash prepare_data.sh
```

This script will:

- Extract and clean Bluesky posts from the SQLite database
- Generate aggregated statistics and visualizations
- Analyze sentiment and emotions in posts
- Create topic embeddings using Sentence-BERT
- Generate semantic maps with UMAP
- Detect user communities with the Louvain algorithm

### 4. Set Up the Dashboard

```bash
# Change to dashboard directory
cd dashboard

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The dashboard will be available at http://localhost:3000

---

## 📦 Sample Data

The `data/` directory contains preprocessed JSON files that power the dashboard visualizations:

- `clean_posts.json` - Cleaned and structured Bluesky posts
- `clean_posts_with_sentiment.json` - Posts with sentiment scores
- `sentiment_counts.json` - Aggregated sentiment statistics
- `emotion_counts.json` - Emotion distribution data
- `topics.json` - Topic modeling results
- `hashtags.json` - Hashtag frequency and relationships
- `timeline.json` - Temporal posting patterns
- `semantic_map.json` - 2D UMAP projections for visualization

The dashboard automatically loads these files for visualization.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to fix a bug, suggest a feature, or add support for another social platform, please open an issue or PR.

---

## 📄 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for more details.

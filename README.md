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
├── scripts/               # Preprocessing scripts (Python/JS)
├── public/                # Static assets
├── components/            # React components (charts, filters, maps)
├── pages/                 # Next.js / dashboard routes
├── styles/                # Styling files
└── README.md              # This file

```

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cognitivesky.git
cd cognitivesky
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Preprocess Your Data

Run the scripts in `scripts/` to convert your raw Bluesky `.json` exports into structured JSONs compatible with the dashboard:

- sentiment + emotion tagging
- topic embeddings
- metadata extraction

---

## 📦 Sample Data

Until you integrate your real dataset, you can use mock files in `data/sample/` to test the UI and visualization behavior.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to fix a bug, suggest a feature, or add support for another social platform, please open an issue or PR.

---

## 📄 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for more details.

---

## 📚 Citation

If you use this tool in your research, please cite or reference it as:

> Chhetri, G. (2025). _CognitiveSky: A Tool for Exploring Mental Health Narratives on Bluesky_. GitHub Repository. [https://github.com/gauravfs-14/cognitivesky](https://github.com/yourusername/cognitivesky)

---

## 🙌 Acknowledgements

- Inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer)
- Sentiment model: [TweetEval - RoBERTa](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment)
- Topic modeling via [Sentence-BERT](https://www.sbert.net/)
- Visualizations powered by React, D3, Chart.js, and Tailwind

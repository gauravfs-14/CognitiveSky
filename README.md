# 🧠 CognitiveSky

**CognitiveSky** is an open-source research infrastructure and dashboard for analyzing mental health narratives on the Bluesky social platform. Inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer), it integrates real-time data ingestion, robust NLP processing, and interactive visualization to empower researchers, advocates, and developers with actionable social insights.

---

## ⚙️ System Architecture

The CognitiveSky system is built around two primary components:

### 1. Mental Health Worker (mh_worker)

- **Language:** Node.js
- **Host:** Oracle Cloud (free-tier VM)
- **Function:** A real-time listener using Bluesky's Firehose API
- **Purpose:** Filters public posts related to mental health and stores them in a `posts_unlabeled` table within Supabase.
- **Frequency:** Continuous, 24×7 ingestion
- **Output:** Raw mental-health-related posts in Supabase

### 2. Summarization & Labeling Pipeline (`summary.py`)

- **Language:** Python
- **Trigger:** Scheduled daily via GitHub Actions (4 parallel shards × 500 posts)
- **Purpose:** Processes unlabeled posts using:
  - Sentiment analysis (`cardiffnlp/twitter-roberta-base-sentiment`)
  - Emotion detection (`j-hartmann/emotion-english-distilroberta-base`)
  - Topic modeling (NMF + TF-IDF)
- **Database:** Processes are stored in Turso (libSQL)
- **Output:** JSON snapshots written to `/summary/*.json` for dashboard rendering

---

## 🧪 Data Flow

```bash
      ┌────────────────────┐
      │ Bluesky Firehose   │
      └────────┬───────────┘
               │
               ▼
     ┌────────────────────┐
     │   mh_worker (Node) │
     │  Filter + Ingest   │
     └────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Supabase (Unlabeled) │
   └────────┬─────────────┘
            │
            ▼
  ┌─────────────────────────┐
  │ summary.py (GitHub CI)  │
  │ NLP + Topics + Migrate  │
  └────────┬────────────────┘
           │
           ▼
    ┌────────────────┐
    │   Turso DB     │
    │ (Labeled Data) │
    └────────┬───────┘
             │
             ▼
    ┌──────────────────────┐
    │ summary_snapshots DB │
    └────────┬─────────────┘
             │
             ▼
    ┌────────────────────┐
    │  JSON Files (📁)   │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │   Dashboard (Web)  │
    └────────────────────┘
```

---

## 📦 Summary Outputs

Every run of the summarization pipeline generates JSON files like:

- `summary/narratives.json`: Sentiment & language distributions
- `summary/emotions.json`: Emotion category trends
- `summary/hashtags.json`: Trending hashtags and emojis
- `summary/activity.json`: Post volume over time
- `summary/engagement.json`: Top posts and active users
- `summary/topics.json`: Topic distributions, keywords, and per-topic sentiment/emotion/hashtags

Each is grouped by date to support historical and temporal exploration in the dashboard.

---

## 📊 Dashboard

- **Framework:** React + Next.js + Recharts
- **Features:**
  - Topic-wise sentiment/emotion timelines
  - Hashtag and emoji trends
  - Most active users and posts
  - Narrative shifts across time
- **Data Source:** JSON files from `summary/` directory

---

## 🚀 Get Started

### 1. Clone the Repo

```bash
git clone https://github.com/gauravfs-14/CognitiveSky.git
cd CognitiveSky
```

### 2. Setup Environment

```bash
cp .env.example .env
# Fill in Supabase, Turso, and Bluesky credentials
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

or use the conda environment provided with `environment.yml`.

```bash
conda env create -f environment.yml
conda activate cognitive-sky
```

### 4. Start the Mental Health Worker

Ensure you have Node.js installed, then run:

```bash
cd mh_worker
npm install
```

Set up the environment variables in `mh_worker/.env` with your Bluesky credentials and Supabase connection details.

Then start the worker:

```bash
npm start
```

This will start the real-time listener that filters and ingests mental health posts into Supabase.

### 5. Run Summary Pipeline

To process the unlabeled posts and generate summaries, run:

```bash
EXPORT_ONLY=0 python scripts/summary.py && EXPORT_ONLY=1 python scripts/summary.py
```

This will:

- Process the unlabeled posts
- Generate sentiment, emotion, and topic summaries
- Export the results to JSON files in the `summary/` directory

You can also run the script with the `EXPORT_ONLY` environment variable to control whether to export the summaries or just process the snapshots:

```bash
EXPORT_ONLY=0 python scripts/summary.py
```

Or export just the snapshots:

```bash
EXPORT_ONLY=1 python scripts/summary.py
```

---

## 🤝 Contributing

We welcome contributions from researchers, developers, and mental health advocates. You can:

* Suggest new metrics or visualizations
* Help improve NLP model support
* Extend to other languages or regions
* Report bugs or submit PRs

---

## 📄 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

## Acknowledgements

This project was initially inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer) and aims to build a similar infrastructure for Bluesky mental health narratives. Special thanks to the Bluesky community for their support and resources.

Developed by [Gaurab Chhetri](https://gaurabchhetri.com), Supported by [AIT Lab](https://ait-lab.vercel.app).

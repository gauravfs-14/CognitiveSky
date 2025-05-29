# 🧠 CognitiveSky

[![GitHub Stars](https://img.shields.io/github/stars/gauravfs-14/CognitiveSky?style=social)](https://github.com/gauravfs-14/CognitiveSky)
[![GitHub Forks](https://img.shields.io/github/forks/gauravfs-14/CognitiveSky?style=social)](https://github.com/gauravfs-14/CognitiveSky)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Daily Labeling and Summary Export](https://github.com/gauravfs-14/CognitiveSky/actions/workflows/data-labeling.yml/badge.svg)](https://github.com/gauravfs-14/CognitiveSky/actions/workflows/data-labeling.yml)

**CognitiveSky** is an open-source research infrastructure and dashboard for analyzing mental health narratives on the Bluesky social platform. Inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer), it integrates real-time data ingestion, robust NLP processing, and interactive visualization to empower researchers, advocates, and developers with actionable social insights.

> **Live Dashboard:** [CognitiveSky Dashboard](https://cognitivesky.vercel.app)

## 📖 Table of Contents

- [🌟 Features](#-features)
- [⚙️ System Architecture](#️-system-architecture)
- [🔨 Tools And Technologies](#-tools-and-technologies)
- [🧪 Data Flow](#-data-flow)
- [📦 Summary Outputs](#-summary-outputs)
- [📊 Dashboard](#-dashboard)
- [🚀 Get Started](#-get-started)
- [🛠️ Makefile Commands](#️-makefile-commands)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [Acknowledgements](#acknowledgements)

## 🌟 Features

- **Real-time Data Ingestion:** Continuously collects public posts related to mental health from Bluesky using the Firehose API.
- **NLP Processing:** Applies state-of-the-art sentiment analysis, emotion detection, and topic modeling to understand mental health narratives.
- **Interactive Dashboard:** Visualizes trends, user engagement, and topic distributions using React and Next.js.
- **Open Source:** Fully transparent and community-driven, allowing contributions from researchers and developers.

## ⚙️ System Architecture

The CognitiveSky system is built around two primary components:

### 1. Mental Health Worker (`mh_worker`)

- **Language:** Node.js
- **Host:** Oracle Cloud (free-tier VM)
- **Function:** A real-time listener using Bluesky's Firehose API
- **Purpose:** Filters public posts related to mental health and stores them in a `posts_unlabeled` table within Supabase.
- **Frequency:** Continuous, 24×7 ingestion
- **Output:** Raw mental-health-related posts in Supabase

> **Read more about the worker:** [mh_worker README](https://github.com/gauravfs-14/CognitiveSky/tree/main/mh_worker)

### 2. Summarization & Labeling Pipeline (`summary.py`)

[![Daily Labeling and Summary Export](https://github.com/gauravfs-14/CognitiveSky/actions/workflows/data-labeling.yml/badge.svg)](https://github.com/gauravfs-14/CognitiveSky/actions/workflows/data-labeling.yml)

- **Language:** Python
- **Trigger:** Scheduled daily via GitHub Actions (4 parallel shards × 500 posts)
- **Purpose:** Processes unlabeled posts using:
  - Sentiment analysis (`cardiffnlp/twitter-roberta-base-sentiment`)
  - Emotion detection (`j-hartmann/emotion-english-distilroberta-base`)
  - Topic modeling (NMF + TF-IDF)
- **Database:** Processes are stored in Turso (libSQL)
- **Output:** JSON snapshots written to `/summary/*.json` for dashboard rendering

> **View Latest Summary Output:** [Latest Summary JSON](https://github.com/gauravfs-14/CognitiveSky/tree/main/summary)

## 🔨 Tools And Technologies

### Data Ingestion `mh_worker`

- **Node.js:** For real-time data ingestion
- **Bluesky Firehose API:** Streams public posts using `@atproto/sync` and `@atproto/api` libraries
- **Supabase:** Acts as the database for storing unlabeled posts
- **Oracle Cloud:** Hosts the worker for continuous operation

### NLP Processing and Summarization `summary.py`

- **Python:** Main language for NLP processing
- **Transformers:** For sentiment and emotion analysis using pre-trained models
- **Turso (libSQL):** Lightweight database for storing labeled data
- **GitHub Actions:** Automates daily processing and export of summaries
- **NLP Libraries:** 
  - `transformers` for sentiment and emotion analysis
  - `scikit-learn` for topic modeling

### Dashboard

- **React + Next.js:** Frontend framework for building the dashboard
- **Tailwind CSS + shadcn/ui:** For styling the dashboard components
- **Recharts:** For data visualization

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

## 📦 Summary Outputs

Every run of the summarization pipeline generates JSON files like:

- `summary/narratives.json`: Sentiment & language distributions
- `summary/emotions.json`: Emotion category trends
- `summary/hashtags.json`: Trending hashtags and emojis
- `summary/activity.json`: Post volume over time
- `summary/engagement.json`: Top posts and active users
- `summary/topics.json`: Topic distributions, keywords, and per-topic sentiment/emotion/hashtags

Each is grouped by date to support historical and temporal exploration in the dashboard.

> **View Example Output:** [Sample JSON Output](https://github.com/gauravfs-14/CognitiveSky/tree/main/summary_ref)

## 📊 Dashboard

- **Framework:** React + Next.js + Recharts
- **Features:**
  - Topic-wise sentiment/emotion timelines
  - Hashtag and emoji trends
  - Most active users and posts
  - Narrative shifts across time
- **Data Source:** JSON files from `summary/` directory

> **Live Demo:** [CognitiveSky Dashboard](https://cognitivesky.vercel.app) | **Source Code:** [Dashboard Code](https://github.com/gauravfs-14/CognitiveSky/tree/main/dashboard)

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

## 🛠️ Makefile Commands

The project includes a Makefile for streamlined testing and production workflows. Below are the available commands:

### Test Commands

- `make test-label`: Run full labeling and snapshot generation in `TEST_MODE`.
- `make test-export`: Export summary JSONs only from the test database.
- `make test-db-to-db`: Generate snapshot DB from labeled posts in `TEST_MODE`.
- `make test-full`: Run full labeling and snapshot generation in `TEST_MODE`, followed by exporting JSONs.

### Production Commands

- `make prod-label`: Run full labeling and snapshot generation on the production database.
- `make prod-export`: Export summary JSONs only from the production database.

### Utility Commands

- `make clean-test-db`: Remove the local test database.
- `make gen-dummy`: Generate dummy data for testing.
- `make help`: Display the list of available Makefile commands.

## 🤝 Contributing

We welcome contributions from researchers, developers, and mental health advocates. You can:

- Suggest new metrics or visualizations
- Help improve NLP model support
- Extend to other languages or regions
- Report bugs or submit PRs

## 📄 License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

## Acknowledgements

This project was initially inspired by [TwiXplorer](https://github.com/smash-edin/twixplorer) and aims to build a similar infrastructure for Bluesky mental health narratives. Special thanks to:

- **Bluesky Community:** For their support and resources.
- **Oracle Cloud:** For providing the Forever Free Tier VM hosting the `mh_worker`.
- **Supabase:** For enabling seamless database integration and real-time data storage.
- **Hugging Face Transformers:** For providing pre-trained models used in sentiment and emotion analysis.
- **AIT Lab:** For their guidance, collaboration, and technical support.
- **Open Source Contributors:** For their valuable feedback, suggestions, and code contributions.

Developed by [Gaurab Chhetri](https://gaurabchhetri.com.np), Supported by [AIT Lab](https://ait-lab.vercel.app).

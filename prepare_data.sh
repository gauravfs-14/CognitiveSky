#!/bin/bash

# === Config ===
LOG_FILE="data_pipeline.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# === Helper Functions ===
function separator {
    echo -e "\n=========================\n"
}

function timestamp {
    date "+[%Y-%m-%d %H:%M:%S]"
}

function step {
    echo -e "$(timestamp) $1"
}

# === Pipeline Start ===
echo "🚀 Starting Data Preparation Pipeline..."
separator

step "📁 Step 1: Generating clean JSON from DB..."
python scripts/extract_clean_posts.py || { step "❌ Failed at scripts/extract_clean_posts.py"; exit 1; }

separator
step "📊 Step 2: Generating aggregates..."
python scripts/generate_aggregates.py || { step "❌ Failed at scripts/generate_aggregates.py"; exit 1; }

separator
step "🧠 Step 3: Analyzing sentiments..."
python scripts/analyze_sentiment_emotion.py || { step "❌ Failed at scripts/analyze_sentiment_emotion.py"; exit 1; }

separator
step "✅ Pipeline complete!"
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
step "💡 Step 4: Generating topics..."
python scripts/generate_topics.py || { step "❌ Failed at scripts/generate_topics.py"; exit 1; }

separator
step "🏷️ Step 5: Generating topic labels..."
python scripts/generate_topic_labels.py || { step "❌ Failed at scripts/generate_topic_labels.py"; exit 1; }

separator
step "📈 Step 6: Generating summary stats..."
python scripts/generate_summary_stats.py || { step "❌ Failed at scripts/generate_summary_stats.py"; exit 1; }

separator
step "🔃 Step 7: Generating user network..."
python scripts/generate_user_networks.py || { step "❌ Failed at scripts/generate_user_networks.py"; exit 1; }

separator
step "🔄 Step 8: Merging data..."
python scripts/merge_semantic_topics.py || { step "❌ Failed at scripts/merge_semantic_topics.py"; exit 1; }

separator
step "📦 Step 9: Generating dashbard dataset..."
python scripts/generate_dashboard_data.py || { step "❌ Failed at scripts/generate_dashboard_data.py"; exit 1; }

separator
step "✅ Pipeline complete!"
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification

def ensure_model_downloaded(model_id: str, save_path: str):
    save_path = os.path.expanduser(save_path)
    config_path = os.path.join(save_path, "config.json")
    model_path = os.path.join(save_path, "pytorch_model.bin")

    if not os.path.exists(config_path) or not os.path.exists(model_path):
        print(f"⬇️ Downloading model: {model_id} to {save_path}")
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_id)
            model = AutoModelForSequenceClassification.from_pretrained(model_id)

            tokenizer.save_pretrained(save_path)
            model.save_pretrained(save_path)
            print(f"✅ Saved {model_id} to {save_path}")
        except Exception as e:
            print(f"❌ Failed to download {model_id}: {e}")
    else:
        print(f"✅ Model already exists at {save_path}")

# === Sentiment Model ===
ensure_model_downloaded(
    model_id="cardiffnlp/twitter-roberta-base-sentiment",
    save_path="~/.hf_models/sentiment"
)

# === Emotion Model ===
ensure_model_downloaded(
    model_id="j-hartmann/emotion-english-distilroberta-base",
    save_path="~/.hf_models/emotion"
)

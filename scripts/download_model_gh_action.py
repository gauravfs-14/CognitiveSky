import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification

sentiment_path = os.path.expanduser('~/.hf_models/sentiment')

if not os.path.exists(os.path.join(sentiment_path, 'config.json')):
    AutoTokenizer.from_pretrained('cardiffnlp/twitter-roberta-base-sentiment').save_pretrained(sentiment_path)
    AutoModelForSequenceClassification.from_pretrained('cardiffnlp/twitter-roberta-base-sentiment').save_pretrained(sentiment_path)

emotion_path = os.path.expanduser('~/.hf_models/emotion')
if not os.path.exists(os.path.join(emotion_path, 'config.json')):
    AutoTokenizer.from_pretrained('j-hartmann/emotion-english-distilroberta-base').save_pretrained(emotion_path)
    AutoModelForSequenceClassification.from_pretrained('j-hartmann/emotion-english-distilroberta-base').save_pretrained(emotion_path)
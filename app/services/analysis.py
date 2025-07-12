
import pandas as pd
from collections import Counter
from app.utils.nlp_processor import analyze_sentiment, extract_common_phrases
from app.services.visualization import prepare_chart_data

def analyze_reviews(df, text_column='Reviews'):
    # Sentiment analysis
    df = analyze_sentiment(df, text_column)
    
    # Common phrases extraction
    common_phrases = extract_common_phrases(df[text_column].tolist())
    
    # Visualization data preparation
    chart_data = prepare_chart_data(df)
    
    return {
        "mean_positive": chart_data['sentiment']['means'][0],
        "mean_negative": chart_data['sentiment']['means'][1],
        "count_positive": chart_data['counts']['values'][0],
        "count_negative": chart_data['counts']['values'][1],
        "common_phrases": common_phrases,
        "chart_data": chart_data
    }

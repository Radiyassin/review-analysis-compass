
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from collections import Counter

# Initialize NLTK components
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)
except:
    pass

sia = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words('english'))
stop_words.update(["a", "an", "the", "is", "are", "to", "in", "of", "and", "for", "on", "with"])

def analyze_sentiment(df, text_column='Reviews'):
    df[text_column] = df[text_column].astype(str).replace('nan', '')
    df['sentiment_score'] = df[text_column].apply(lambda x: sia.polarity_scores(x)['compound'])
    df['sentiment'] = df['sentiment_score'].apply(
        lambda x: 'positive' if x > 0.05 else 'negative' if x < -0.05 else 'neutral'
    )
    return df

def extract_common_phrases(reviews):
    phrases = []
    for review in reviews:
        review_str = str(review).lower()
        tokens = nltk.word_tokenize(review_str)
        filtered_tokens = [token for token in tokens if token not in stop_words and token.isalpha()]
        phrases.extend(filtered_tokens)
    return Counter(phrases).most_common(10)

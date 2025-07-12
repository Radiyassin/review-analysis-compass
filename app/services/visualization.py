
def prepare_chart_data(df):
    positive_df = df[df['sentiment'] == 'positive']
    negative_df = df[df['sentiment'] == 'negative']
    neutral_df = df[df['sentiment'] == 'neutral']

    return {
        'sentiment': {
            'labels': ['Positive', 'Negative'],
            'means': [
                positive_df['sentiment_score'].mean() if not positive_df.empty else 0,
                negative_df['sentiment_score'].mean() if not negative_df.empty else 0
            ]
        },
        'counts': {
            'labels': ['Positive', 'Negative'],
            'values': [len(positive_df), len(negative_df)]
        },
        'distribution': {
            'labels': ['Positive', 'Neutral', 'Negative'],
            'values': [len(positive_df), len(neutral_df), len(negative_df)]
        }
    }

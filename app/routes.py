
from flask import Blueprint, send_from_directory, request, jsonify, send_file
from app.services.analysis import analyze_reviews
from app.utils.file_handler import save_uploaded_file, generate_excel_report
from app.utils.nlp_processor import extract_common_phrases
import pandas as pd
from datetime import datetime
import numpy as np
import os
from flask import session
import openai
from flask import current_app

main_bp = Blueprint('main', __name__)

# Serve React app
@main_bp.route('/')
def serve_index():
    return send_from_directory('dist', 'index.html')

@main_bp.route('/<path:path>')
def serve_static(path):
    # Try to serve from dist first (React build)
    try:
        return send_from_directory('dist', path)
    except:
        # Fallback to assets
        return send_from_directory('dist/assets', path)

# API Routes
@main_bp.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        os.makedirs('uploads', exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"uploads/{timestamp}_{file.filename}"
        file.save(file_path)

        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400

        required_columns = ['Reviews']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return jsonify({
                "error": f"Missing required columns: {', '.join(missing_cols)}",
                "available_columns": list(df.columns)
            }), 400

        df = df.dropna(subset=['Reviews'])

        from app.utils.nlp_processor import analyze_sentiment, extract_common_phrases
        df = analyze_sentiment(df, 'Reviews')

        product_info = {
            "Product Name": str(df['Product Name'].iloc[0]) if 'Product Name' in df.columns else 'N/A',
            "Brand Name": str(df['Brand Name'].iloc[0]) if 'Brand Name' in df.columns else 'N/A',
            "Price": float(df['Price'].iloc[0]) if 'Price' in df.columns else 'N/A'
        }

        def count_complaints_by_category(reviews):
            categories = {
                "screen": ["screen", "display", "touch", "brightness"],
                "battery": ["battery", "charge", "charging", "power"],
                "camera": ["camera", "photo", "picture", "lens"],
                "performance": ["slow", "lag", "crash", "freeze", "performance"],
                "build": ["build", "material", "quality", "durability", "scratch"]
            }
            complaint_counts = {key: 0 for key in categories}
            for review in reviews:
                review_lower = str(review).lower()
                for category, keywords in categories.items():
                    if any(kw in review_lower for kw in keywords):
                        complaint_counts[category] += 1
            return complaint_counts

        complaint_summary = count_complaints_by_category(df[df['sentiment'] == 'negative']['Reviews'])

        response_data = {
            "chart_data": {
                "sentiment": {
                    "labels": ["Positive", "Negative"],
                    "means": [
                        float(df[df['sentiment'] == 'positive']['sentiment_score'].mean() or 0),
                        float(df[df['sentiment'] == 'negative']['sentiment_score'].mean() or 0)
                    ]
                },
                "distribution": {
                    "labels": ["Positive", "Neutral", "Negative"],
                    "values": [
                        int(len(df[df['sentiment'] == 'positive'])),
                        int(len(df[df['sentiment'] == 'neutral'])),
                        int(len(df[df['sentiment'] == 'negative']))
                    ]
                },
                "counts": {
                    "labels": ["Total Reviews"],
                    "values": [int(len(df))]
                }
            },
            "product_info": product_info,
            "common_phrases": extract_common_phrases(df['Reviews']),
            "negative_phrases": extract_common_phrases(df[df['sentiment'] == 'negative']['Reviews']),
            "complaint_categories": complaint_summary
        }

        if 'Rating' in df.columns:
            try:
                df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
                df = df.dropna(subset=['Rating'])

                response_data["rating_stats"] = {
                    "average_rating": float(df['Rating'].mean()),
                    "rating_distribution": {
                        str(i): int(df['Rating'].value_counts().get(i, 0)) 
                        for i in range(1, 6)
                    },
                    "sentiment_mean": float(df['sentiment_score'].mean()),
                    "comparison_score": float((df['Rating'].mean()/5) - df['sentiment_score'].mean())
                }
            except Exception as e:
                print(f"Error processing ratings: {str(e)}")

        # Add predicted sales trend based on sentiment
        avg_sentiment = df['sentiment_score'].mean()
        if avg_sentiment > 0.5:
            trend = 'Up'
        elif avg_sentiment < -0.2:
            trend = 'Down'
        else:
            trend = 'Stable'

        response_data["sentiment_score"] = float(avg_sentiment)
        response_data["sales_trend"] = {
            "avg_sentiment": round(float(avg_sentiment), 2),
            "trend": trend,
            "message": f"Predicted sales trend is {trend.lower()} based on sentiment."
        }
        session['reviews_text'] = " ".join(df['Reviews'].astype(str).tolist())[:3000]
        return jsonify(response_data)

    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@main_bp.route('/api/chat', methods=['POST'])
def chat():
    client = openai.OpenAI(api_key=current_app.config['OPENAI_API_KEY'])

    question = request.json.get('question', '')
    context = session.get('reviews_text', '')

    if not context:
        return jsonify({'answer': "Please upload a product review file first."})

    prompt = f"""You are a helpful assistant that answers questions based on product reviews. 
Here are some customer reviews:
---
{context}
---
Now answer this question: {question}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful product assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        answer = response.choices[0].message.content

        return jsonify({'answer': answer})
    except Exception as e:
        print(f"OpenAI error: {e}")
        return jsonify({'answer': "Something went wrong calling OpenAI."})

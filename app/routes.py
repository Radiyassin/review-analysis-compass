
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
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Ensure uploads directory exists
        os.makedirs('uploads', exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"uploads/{timestamp}_{file.filename}"
        file.save(file_path)

        # Read CSV file
        try:
            df = pd.read_csv(file_path)
            print(f"CSV loaded successfully with {len(df)} rows and columns: {list(df.columns)}")
        except Exception as e:
            print(f"Error reading CSV: {str(e)}")
            return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400

        # Check required columns
        required_columns = ['Reviews']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return jsonify({
                "error": f"Missing required columns: {', '.join(missing_cols)}",
                "available_columns": list(df.columns)
            }), 400

        # Clean data
        df = df.dropna(subset=['Reviews'])
        print(f"After cleaning: {len(df)} rows remaining")

        # Analyze sentiment
        from app.utils.nlp_processor import analyze_sentiment, extract_common_phrases
        df = analyze_sentiment(df, 'Reviews')
        print(f"Sentiment analysis completed")

        # Extract product info
        product_info = {
            "Product Name": str(df['Product Name'].iloc[0]) if 'Product Name' in df.columns and len(df) > 0 else 'N/A',
            "Brand Name": str(df['Brand Name'].iloc[0]) if 'Brand Name' in df.columns and len(df) > 0 else 'N/A',
            "Price": float(df['Price'].iloc[0]) if 'Price' in df.columns and len(df) > 0 and pd.notna(df['Price'].iloc[0]) else 'N/A'
        }

        # Count complaints by category
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

        # Prepare chart data
        pos_sentiment_mean = float(df[df['sentiment'] == 'positive']['sentiment_score'].mean()) if len(df[df['sentiment'] == 'positive']) > 0 else 0
        neg_sentiment_mean = float(df[df['sentiment'] == 'negative']['sentiment_score'].mean()) if len(df[df['sentiment'] == 'negative']) > 0 else 0

        response_data = {
            "chart_data": {
                "sentiment": {
                    "labels": ["Positive", "Negative"],
                    "means": [pos_sentiment_mean, neg_sentiment_mean]
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

        # Handle ratings if available
        if 'Rating' in df.columns:
            try:
                df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
                df_with_ratings = df.dropna(subset=['Rating'])

                if len(df_with_ratings) > 0:
                    response_data["rating_stats"] = {
                        "average_rating": float(df_with_ratings['Rating'].mean()),
                        "rating_distribution": {
                            str(i): int(df_with_ratings['Rating'].value_counts().get(i, 0)) 
                            for i in range(1, 6)
                        },
                        "sentiment_mean": float(df['sentiment_score'].mean()),
                        "comparison_score": float((df_with_ratings['Rating'].mean()/5) - df['sentiment_score'].mean())
                    }
            except Exception as e:
                print(f"Error processing ratings: {str(e)}")

        # Add predicted sales trend based on sentiment
        avg_sentiment = float(df['sentiment_score'].mean())
        if avg_sentiment > 0.05:
            trend = 'Up'
        elif avg_sentiment < -0.05:
            trend = 'Down'
        else:
            trend = 'Stable'

        response_data["sentiment_score"] = avg_sentiment
        response_data["sales_trend"] = {
            "avg_sentiment": round(avg_sentiment, 2),
            "trend": trend,
            "message": f"Predicted sales trend is {trend.lower()} based on sentiment."
        }
        
        # Store context for chat
        session['reviews_text'] = " ".join(df['Reviews'].astype(str).tolist())[:3000]
        
        print("Response data prepared successfully")
        return jsonify(response_data)

    except Exception as e:
        print(f"Server error in upload_file: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
@main_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not current_app.config.get('OPENAI_API_KEY'):
            return jsonify({'answer': "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."})

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
        return jsonify({'answer': f"Error: {str(e)}"})


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
import traceback

main_bp = Blueprint('main', __name__)

# Serve React app
@main_bp.route('/')
def serve_index():
    try:
        dist_path = current_app.static_folder
        index_path = os.path.join(dist_path, 'index.html')
        
        print(f"Trying to serve index.html from: {index_path}")
        print(f"File exists: {os.path.exists(index_path)}")
        
        if os.path.exists(index_path):
            return send_from_directory(dist_path, 'index.html')
        else:
            return """
            <h1>React Build Not Found</h1>
            <p>Please run the following commands to build the React app:</p>
            <pre>
npm install
npm run build
            </pre>
            <p>Then restart the Flask server with: <code>python main.py</code></p>
            """, 404
    except Exception as e:
        print(f"Error serving index: {str(e)}")
        return f"Error: {str(e)}", 500

@main_bp.route('/<path:path>')
def serve_static(path):
    try:
        dist_path = current_app.static_folder
        file_path = os.path.join(dist_path, path)
        
        print(f"Trying to serve static file: {file_path}")
        
        if os.path.exists(file_path):
            return send_from_directory(dist_path, path)
        else:
            # If file doesn't exist, serve index.html for React routing
            return serve_index()
    except Exception as e:
        print(f"Error serving static file {path}: {str(e)}")
        return serve_index()

# API Routes
@main_bp.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        print("\n" + "="*50)
        print("UPLOAD ENDPOINT CALLED")
        print("="*50)
        
        # Check if file is in request
        if 'file' not in request.files:
            print("ERROR: No file in request.files")
            print("Available keys:", list(request.files.keys()))
            return jsonify({"error": "No file uploaded", "success": False}), 400

        file = request.files['file']
        if not file or file.filename == '':
            print("ERROR: Empty filename or no file")
            return jsonify({"error": "No selected file", "success": False}), 400

        print(f"Processing file: {file.filename}")
        print(f"File size: {file.content_length if hasattr(file, 'content_length') else 'Unknown'}")

        # Ensure uploads directory exists
        uploads_dir = 'uploads'
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            print(f"Created uploads directory: {uploads_dir}")

        # Save file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(uploads_dir, filename)
        
        print(f"Saving file to: {file_path}")
        file.save(file_path)
        
        if not os.path.exists(file_path):
            print("ERROR: File was not saved properly")
            return jsonify({"error": "Failed to save file", "success": False}), 500
            
        print(f"File saved successfully. Size: {os.path.getsize(file_path)} bytes")

        # Read and validate CSV
        try:
            print("Reading CSV file...")
            df = pd.read_csv(file_path, encoding='utf-8')
            print(f"CSV loaded: {len(df)} rows, {len(df.columns)} columns")
            print(f"Columns: {list(df.columns)}")
            print(f"First few rows preview:")
            print(df.head().to_string())
            
        except UnicodeDecodeError:
            try:
                print("UTF-8 failed, trying latin-1 encoding...")
                df = pd.read_csv(file_path, encoding='latin-1')
                print(f"CSV loaded with latin-1: {len(df)} rows, {len(df.columns)} columns")
            except Exception as e:
                print(f"ERROR reading CSV with latin-1: {str(e)}")
                return jsonify({"error": f"Failed to read CSV file: {str(e)}", "success": False}), 400
        except Exception as e:
            print(f"ERROR reading CSV: {str(e)}")
            return jsonify({"error": f"Failed to read CSV: {str(e)}", "success": False}), 400

        # Check for required columns
        required_columns = ['Reviews']
        missing_cols = [col for col in required_columns if col not in df.columns]
        
        if missing_cols:
            print(f"Missing required columns: {missing_cols}")
            print(f"Available columns: {list(df.columns)}")
            # Try to find similar column names
            potential_review_cols = [col for col in df.columns if 'review' in col.lower() or 'comment' in col.lower() or 'feedback' in col.lower()]
            if potential_review_cols:
                print(f"Potential review columns found: {potential_review_cols}")
                return jsonify({
                    "error": f"Missing 'Reviews' column. Found potential columns: {', '.join(potential_review_cols)}",
                    "available_columns": list(df.columns),
                    "success": False
                }), 400
            else:
                return jsonify({
                    "error": f"Missing required 'Reviews' column",
                    "available_columns": list(df.columns),
                    "success": False
                }), 400

        # Clean the data
        print("Cleaning data...")
        original_count = len(df)
        
        # Handle missing values in Reviews column
        df = df.dropna(subset=['Reviews'])
        df = df[df['Reviews'].astype(str).str.strip() != '']
        df = df[df['Reviews'].astype(str) != 'nan']
        
        cleaned_count = len(df)
        print(f"Data cleaned: {cleaned_count} rows remaining (from {original_count})")

        if cleaned_count == 0:
            return jsonify({"error": "No valid reviews found after cleaning", "success": False}), 400

        # Perform sentiment analysis
        print("Starting sentiment analysis...")
        from app.utils.nlp_processor import analyze_sentiment
        
        df = analyze_sentiment(df, 'Reviews')
        print("Sentiment analysis completed")
        print(df['sentiment'].value_counts().to_dict())

        # Extract product information
        print("Extracting product information...")
        product_info = {}
        
        # Try to get product info from first row
        for col_name in ['Product Name', 'ProductName', 'product_name', 'Product', 'Name']:
            if col_name in df.columns and len(df) > 0:
                val = df[col_name].iloc[0]
                if pd.notna(val) and str(val).strip():
                    product_info['Product Name'] = str(val).strip()
                    break
        
        for col_name in ['Brand Name', 'BrandName', 'brand_name', 'Brand', 'Manufacturer']:
            if col_name in df.columns and len(df) > 0:
                val = df[col_name].iloc[0]
                if pd.notna(val) and str(val).strip():
                    product_info['Brand Name'] = str(val).strip()
                    break
        
        for col_name in ['Price', 'price', 'Cost', 'cost']:
            if col_name in df.columns and len(df) > 0:
                val = df[col_name].iloc[0]
                if pd.notna(val):
                    try:
                        price_val = float(str(val).replace('$', '').replace(',', ''))
                        product_info['Price'] = f"${price_val:.2f}"
                    except:
                        product_info['Price'] = str(val)
                    break

        # Set defaults if not found
        if 'Product Name' not in product_info:
            product_info['Product Name'] = 'Unknown Product'
        if 'Brand Name' not in product_info:
            product_info['Brand Name'] = 'Unknown Brand'  
        if 'Price' not in product_info:
            product_info['Price'] = 'N/A'
            
        print(f"Product info: {product_info}")

        # Calculate sentiment statistics
        print("Calculating sentiment statistics...")
        sentiment_counts = df['sentiment'].value_counts()
        pos_count = sentiment_counts.get('positive', 0)
        neg_count = sentiment_counts.get('negative', 0)
        neu_count = sentiment_counts.get('neutral', 0)
        
        # Calculate mean sentiment scores by category
        pos_mean = float(df[df['sentiment'] == 'positive']['sentiment_score'].mean()) if pos_count > 0 else 0
        neg_mean = float(df[df['sentiment'] == 'negative']['sentiment_score'].mean()) if neg_count > 0 else 0
        
        # Overall sentiment score
        overall_sentiment = float(df['sentiment_score'].mean())
        
        print(f"Sentiment stats: Pos={pos_count}, Neg={neg_count}, Neu={neu_count}")
        print(f"Sentiment means: Pos={pos_mean:.3f}, Neg={neg_mean:.3f}, Overall={overall_sentiment:.3f}")

        # Extract common phrases
        print("Extracting common phrases...")
        try:
            common_phrases = extract_common_phrases(df['Reviews'].tolist())
            negative_reviews = df[df['sentiment'] == 'negative']['Reviews'].tolist()
            negative_phrases = extract_common_phrases(negative_reviews) if negative_reviews else []
            print(f"Common phrases extracted: {len(common_phrases)} total, {len(negative_phrases)} negative")
        except Exception as e:
            print(f"Error extracting phrases: {str(e)}")
            common_phrases = []
            negative_phrases = []

        # Prepare chart data
        chart_data = {
            "sentiment": {
                "labels": ["Positive", "Negative"],
                "means": [pos_mean, abs(neg_mean)]  # Make negative mean positive for display
            },
            "distribution": {
                "labels": ["Positive", "Neutral", "Negative"],
                "values": [int(pos_count), int(neu_count), int(neg_count)]
            },
            "counts": {
                "labels": ["Total Reviews"],
                "values": [int(len(df))]
            }
        }

        # Determine sales trend
        if overall_sentiment > 0.05:
            trend = 'Up'
            message = "Customers are mostly satisfied, so the product is likely to sell well."
        elif overall_sentiment < -0.05:
            trend = 'Down' 
            message = "Many customers are unhappy, which may reduce future sales."
        else:
            trend = 'Stable'
            message = "Customer opinions are mixed, so sales are expected to stay the same."

        sales_trend = {
            "avg_sentiment": round(overall_sentiment, 3),
            "trend": trend,
            "message": message
        }

        # Build response
        response_data = {
            "success": True,
            "chart_data": chart_data,
            "product_info": product_info,
            "common_phrases": common_phrases,
            "negative_phrases": negative_phrases,
            "sentiment_score": overall_sentiment,
            "sales_trend": sales_trend,
            "stats": {
                "total_reviews": int(len(df)),
                "positive_reviews": int(pos_count),
                "negative_reviews": int(neg_count),
                "neutral_reviews": int(neu_count)
            }
        }

        # Store context for chatbot
        try:
            reviews_sample = " ".join(df['Reviews'].astype(str).head(50).tolist())[:2000]
            session['reviews_text'] = reviews_sample
            session['product_info'] = product_info
            print("Context stored for chatbot")
        except Exception as e:
            print(f"Warning: Could not store context for chatbot: {str(e)}")

        print("="*50)
        print("ANALYSIS COMPLETED SUCCESSFULLY")
        print(f"Response keys: {list(response_data.keys())}")
        print("="*50)
        
        return jsonify(response_data)

    except Exception as e:
        print(f"\n{'='*50}")
        print("CRITICAL ERROR IN UPLOAD ENDPOINT")
        print(f"{'='*50}")
        print(f"Error: {str(e)}")
        print("Full traceback:")
        traceback.print_exc()
        print(f"{'='*50}")
        
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "success": False
        }), 500

@main_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        print(f"Chat endpoint called")
        
        # Get the question from request
        data = request.get_json()
        if not data:
            return jsonify({'answer': "Invalid request - no JSON data received."})
            
        question = data.get('question', '').strip()
        if not question:
            return jsonify({'answer': "Please ask a question about your data."})
        
        print(f"Question: {question}")
        
        # Check for context (uploaded data)
        context = session.get('reviews_text', '')
        product_info = session.get('product_info', {})
        
        if not context:
            return jsonify({'answer': "Please upload and analyze a CSV file first to enable chat functionality."})
        
        print(f"Context available: {len(context)} characters")
        print(f"Product info: {product_info}")
        
        # Check if OpenAI API key is configured
        openai_key = current_app.config.get('OPENAI_API_KEY')
        if not openai_key or openai_key == 'your-openai-key-here':
            print("OpenAI API key not configured, using local responses")
            # Return a local response when API key is not available
            return jsonify({'answer': generate_local_chat_response(question, context, product_info)})

        # Use OpenAI API if key is available
        client = openai.OpenAI(api_key=openai_key)

        prompt = f"""You are a helpful assistant analyzing customer reviews for this product:
Product: {product_info.get('Product Name', 'Unknown')}
Brand: {product_info.get('Brand Name', 'Unknown')}
Price: {product_info.get('Price', 'Unknown')}

Here are some customer reviews:
---
{context}
---

Question: {question}

Please provide a helpful answer based on the reviews and product information."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful product review analyst."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        print(f"OpenAI response: {answer}")
        return jsonify({'answer': answer})
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        traceback.print_exc()
        # Fallback to local response on any error
        try:
            context = session.get('reviews_text', '')
            product_info = session.get('product_info', {})
            question = request.get_json().get('question', '') if request.get_json() else ''
            return jsonify({'answer': generate_local_chat_response(question, context, product_info)})
        except:
            return jsonify({'answer': "Sorry, I'm having trouble processing your question right now. Please try again."})

def generate_local_chat_response(question, context, product_info):
    """Generate a response using local analysis when OpenAI API is not available"""
    question_lower = question.lower()
    
    # Product information responses
    if any(word in question_lower for word in ['product', 'name', 'what is']):
        product_name = product_info.get('Product Name', 'Unknown Product')
        brand_name = product_info.get('Brand Name', 'Unknown Brand')
        price = product_info.get('Price', 'N/A')
        return f"This analysis is for {product_name} by {brand_name}, priced at {price}."
    
    # Sentiment-related questions
    if any(word in question_lower for word in ['sentiment', 'feeling', 'opinion', 'positive', 'negative']):
        return "Based on the uploaded reviews, I can see the overall sentiment analysis. The data shows how customers feel about this product. You can see the detailed sentiment breakdown in the charts above."
    
    # Sales trend questions
    if any(word in question_lower for word in ['sales', 'trend', 'forecast', 'future', 'sell']):
        return "The sales forecast is based on customer sentiment analysis. Positive reviews typically indicate good sales potential, while negative reviews might suggest challenges. Check the sales forecast section above for detailed predictions."
    
    # Review count questions
    if any(word in question_lower for word in ['how many', 'count', 'total', 'number']):
        return "I analyzed all the reviews from your uploaded CSV file. You can see the exact numbers in the statistics section above, including total reviews and their sentiment breakdown."
    
    # Common phrases questions
    if any(word in question_lower for word in ['phrase', 'keyword', 'common', 'mention', 'say']):
        return "The analysis identified common phrases and keywords from customer reviews. You can see these in the 'Common Phrases' and 'Word Cloud' sections above."
    
    # Improvement questions
    if any(word in question_lower for word in ['improve', 'better', 'fix', 'problem', 'issue']):
        return "Based on the sentiment analysis, you can identify areas for improvement by looking at negative reviews and common complaint phrases. The analysis shows what customers are saying about your product."
    
    # Default helpful response
    return """I can help you understand your review analysis! Try asking me about:
    
    • Product information ("What product is this?")
    • Overall sentiment ("What's the sentiment like?")
    • Sales trends ("How might this affect sales?")
    • Review statistics ("How many reviews were analyzed?")
    • Common feedback ("What do customers commonly mention?")
    • Areas for improvement ("What can be improved?")
    
    The detailed analysis is shown in the charts and sections above."""

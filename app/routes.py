
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

# ... keep existing code (serve_index and serve_static routes)

# API Routes
@main_bp.route('/api/upload', methods=['POST'])
def upload_file():
    # ... keep existing code (entire upload_file function)
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

        # Store enhanced context for chatbot
        try:
            # Store more comprehensive context
            session['reviews_data'] = {
                'all_reviews': df['Reviews'].tolist()[:100],  # Store up to 100 reviews
                'positive_reviews': df[df['sentiment'] == 'positive']['Reviews'].tolist()[:20],
                'negative_reviews': df[df['sentiment'] == 'negative']['Reviews'].tolist()[:20],
                'neutral_reviews': df[df['sentiment'] == 'neutral']['Reviews'].tolist()[:10],
                'sentiment_stats': {
                    'positive_count': int(pos_count),
                    'negative_count': int(neg_count),
                    'neutral_count': int(neu_count),
                    'overall_sentiment': float(overall_sentiment)
                },
                'common_phrases': common_phrases,
                'negative_phrases': negative_phrases
            }
            session['product_info'] = product_info
            print("Enhanced context stored for chatbot")
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
        print("\n" + "="*30)
        print("CHATBOT ENDPOINT CALLED")
        print("="*30)
        
        if not current_app.config.get('OPENAI_API_KEY'):
            return jsonify({'answer': "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."})

        client = openai.OpenAI(api_key=current_app.config['OPENAI_API_KEY'])

        question = request.json.get('question', '').strip()
        if not question:
            return jsonify({'answer': "Please ask me a question about the product reviews."})

        # Get enhanced context from session
        reviews_data = session.get('reviews_data', {})
        product_info = session.get('product_info', {})

        if not reviews_data:
            return jsonify({'answer': "Please upload a product review file first to enable chat functionality."})

        print(f"Question: {question}")
        print(f"Available reviews: {len(reviews_data.get('all_reviews', []))}")

        # Analyze question type and provide context-specific responses
        question_lower = question.lower()
        
        # Determine question type and build appropriate context
        context_parts = []
        
        # Add product information
        context_parts.append(f"Product: {product_info.get('Product Name', 'Unknown')}")
        context_parts.append(f"Brand: {product_info.get('Brand Name', 'Unknown')}")
        context_parts.append(f"Price: {product_info.get('Price', 'Unknown')}")
        
        # Add sentiment statistics
        stats = reviews_data.get('sentiment_stats', {})
        context_parts.append(f"Total Reviews: {stats.get('positive_count', 0) + stats.get('negative_count', 0) + stats.get('neutral_count', 0)}")
        context_parts.append(f"Positive Reviews: {stats.get('positive_count', 0)}")
        context_parts.append(f"Negative Reviews: {stats.get('negative_count', 0)}")
        context_parts.append(f"Overall Sentiment Score: {stats.get('overall_sentiment', 0):.3f}")

        # Add relevant reviews based on question type
        if any(word in question_lower for word in ['positive', 'good', 'like', 'love', 'best', 'great']):
            positive_reviews = reviews_data.get('positive_reviews', [])[:10]
            if positive_reviews:
                context_parts.append("Recent Positive Reviews:")
                for i, review in enumerate(positive_reviews, 1):
                    context_parts.append(f"{i}. {review[:200]}...")
                    
        elif any(word in question_lower for word in ['negative', 'bad', 'hate', 'worst', 'problem', 'issue', 'complaint']):
            negative_reviews = reviews_data.get('negative_reviews', [])[:10]
            if negative_reviews:
                context_parts.append("Recent Negative Reviews:")
                for i, review in enumerate(negative_reviews, 1):
                    context_parts.append(f"{i}. {review[:200]}...")
                    
        elif any(word in question_lower for word in ['common', 'frequent', 'often', 'mention', 'phrase']):
            common_phrases = reviews_data.get('common_phrases', [])[:10]
            negative_phrases = reviews_data.get('negative_phrases', [])[:5]
            if common_phrases:
                context_parts.append("Most Common Words/Phrases:")
                context_parts.append(", ".join([f"{phrase[0]} ({phrase[1]})" for phrase in common_phrases]))
            if negative_phrases:
                context_parts.append("Common Issues Mentioned:")
                context_parts.append(", ".join([f"{phrase[0]} ({phrase[1]})" for phrase in negative_phrases]))
        else:
            # General question - provide mixed sample
            all_reviews = reviews_data.get('all_reviews', [])[:15]
            if all_reviews:
                context_parts.append("Sample Reviews:")
                for i, review in enumerate(all_reviews, 1):
                    context_parts.append(f"{i}. {review[:150]}...")

        context = "\n".join(context_parts)

        # Create enhanced prompt based on question type
        if any(word in question_lower for word in ['recommend', 'should', 'buy', 'purchase']):
            system_prompt = """You are a helpful product review analyst. Based on customer reviews and sentiment analysis, provide recommendations about whether someone should buy this product. Be honest about both pros and cons."""
        elif any(word in question_lower for word in ['improve', 'better', 'fix', 'solve']):
            system_prompt = """You are a helpful product review analyst. Focus on actionable insights from customer feedback that could help improve the product or address common issues."""
        else:
            system_prompt = """You are a helpful product review analyst. Provide insights based on customer sentiment and feedback. Be specific and reference the data when possible."""

        user_prompt = f"""Based on the following product information and customer reviews:

{context}

Question: {question}

Please provide a helpful, specific answer based on the review data. Use numbers and percentages when relevant, and cite specific customer feedback when appropriate."""

        print(f"Sending request to OpenAI...")
        print(f"Context length: {len(context)} characters")

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content.strip()
        
        print(f"OpenAI Response: {answer[:100]}...")
        print("="*30)
        print("CHATBOT RESPONSE SENT")
        print("="*30)
        
        return jsonify({'answer': answer})
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        traceback.print_exc()
        return jsonify({'answer': f"I apologize, but I encountered an error while processing your question. Please try again or rephrase your question."})

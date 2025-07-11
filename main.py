
import os
from app import create_app

# Set up NLTK data
try:
    import setup_nltk
except Exception as e:
    print(f"Warning: Could not set up NLTK: {e}")

app = create_app()

if __name__ == '__main__':
    print("Starting Flask application...")
    print(f"OpenAI API Key configured: {'Yes' if os.environ.get('OPENAI_API_KEY') else 'No'}")
    app.run(debug=True, host='0.0.0.0', port=5000)


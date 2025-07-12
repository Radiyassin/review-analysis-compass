
import os
from app import create_app

# Set up NLTK data
try:
    import setup_nltk
except Exception as e:
    print(f"Warning: Could not set up NLTK: {e}")

app = create_app()

if __name__ == '__main__':
    print("="*60)
    print("🚀 STARTING FLASK API SERVER (BACKEND ONLY)")
    print("="*60)
    
    # Check both environment variable and config
    has_openai_key = bool(os.environ.get('OPENAI_API_KEY') or app.config.get('OPENAI_API_KEY'))
    print(f"✅ OpenAI API Key configured: {'Yes' if has_openai_key else 'No'}")
    
    if not has_openai_key:
        print("⚠️  Warning: OpenAI API key not found. Chatbot will not work.")
        print("   Set OPENAI_API_KEY in environment or update app/config.py")
    
    print(f"🌐 Backend API will be available at:")
    print(f"   - http://localhost:5000")
    print(f"   - http://127.0.0.1:5000")
    print(f"📡 API Endpoints:")
    print(f"   - POST /api/upload (for file analysis)")
    print(f"   - POST /api/chat (for chatbot)")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)

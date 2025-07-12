
import os

class Config:
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'csv'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    NLTK_DATA = ['vader_lexicon', 'punkt', 'stopwords']
    # Put your OpenAI API key here (replace 'your-openai-key-here' with your actual key)
    OPENAI_API_KEY = 'your-openai-key-here'  # Replace this with your actual OpenAI API key

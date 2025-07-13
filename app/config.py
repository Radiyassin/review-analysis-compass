
import os

class Config:
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'csv'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    NLTK_DATA = ['vader_lexicon', 'punkt', 'stopwords']
    # OpenAI API key - Set via environment variable for security
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY') or None

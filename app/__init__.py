
from flask import Flask
from flask_cors import CORS
from .config import Config
from .utils.file_handler import ensure_upload_folder
import os

def create_app():
    print("🔧 Creating Flask app for API-only mode...")
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes and origins (important for API access)
    CORS(app, 
         origins=['*'],  # Allow all origins for testing
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])

    ensure_upload_folder(app.config['UPLOAD_FOLDER'])
    print(f"📁 Upload folder ready: {app.config['UPLOAD_FOLDER']}")

    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    print("✅ Flask app created successfully!")
    return app

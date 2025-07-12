
from flask import Flask
from flask_cors import CORS
from .config import Config
from .utils.file_handler import ensure_upload_folder
import os

def create_app():
    # Get the absolute path to the project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dist_path = os.path.join(project_root, 'dist')
    
    print(f"Looking for React build files in: {dist_path}")
    print(f"Dist folder exists: {os.path.exists(dist_path)}")
    
    app = Flask(__name__, 
                static_folder=dist_path, 
                static_url_path='',
                template_folder=dist_path)
    
    app.config.from_object(Config)
    CORS(app)

    ensure_upload_folder(app.config['UPLOAD_FOLDER'])

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app

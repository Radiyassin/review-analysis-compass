
from flask import Flask
from flask_cors import CORS
from .config import Config
from .utils.file_handler import ensure_upload_folder

def create_app():
    app = Flask(__name__, static_folder='../dist', template_folder='../dist')
    app.config.from_object(Config)
    CORS(app)

    ensure_upload_folder(app.config['UPLOAD_FOLDER'])

    from .routes import main_bp
    app.register_blueprint(main_bp)

    return app

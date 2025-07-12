
# Sentiment Analysis Dashboard - Deployment Guide

## Project Structure
```
your-project/
├── app/                     # Flask backend
│   ├── __init__.py
│   ├── config.py
│   ├── routes.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── analysis.py
│   │   └── visualization.py
│   └── utils/
│       ├── __init__.py
│       ├── file_handler.py
│       └── nlp_processor.py
├── src/                     # React frontend source
├── public/                  # React public assets
├── dist/                    # Built React app (created after build)
├── uploads/                 # CSV upload folder (created automatically)
├── main.py                  # Flask app entry point
├── requirements.txt         # Python dependencies
├── package.json            # Node.js dependencies
└── deploy.sh               # Deployment script
```

## Step-by-Step Deployment in Visual Studio Code

### Prerequisites
1. Install Python 3.8+ from https://python.org
2. Install Node.js 16+ from https://nodejs.org
3. Install Visual Studio Code from https://code.visualstudio.com

### Step 1: Open Project in VS Code
1. Open Visual Studio Code
2. Click "File" → "Open Folder"
3. Select your project folder
4. Open the integrated terminal: "View" → "Terminal" or Ctrl+`

### Step 2: Set Up Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Set Up Node.js Dependencies
```bash
# Install Node.js dependencies
npm install

# Build React frontend
npm run build
```

### Step 4: Set Environment Variables
```bash
# Set OpenAI API key (replace with your actual key)
# On Windows Command Prompt:
set OPENAI_API_KEY=your-openai-api-key-here

# On Windows PowerShell:
$env:OPENAI_API_KEY="your-openai-api-key-here"

# On Mac/Linux:
export OPENAI_API_KEY="your-openai-api-key-here"
```

### Step 5: Run the Application
```bash
# Start Flask server
python main.py
```

### Step 6: Access the Application
Open your browser and go to: http://localhost:5000

## Troubleshooting

### Common Issues:
1. **ModuleNotFoundError**: Make sure virtual environment is activated
2. **NLTK Data Missing**: The app will download NLTK data automatically
3. **OpenAI API Errors**: Make sure OPENAI_API_KEY is set correctly
4. **File Upload Errors**: Check that uploads/ folder has write permissions

### VS Code Extensions (Recommended):
- Python
- Python Debugger
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense

## Production Deployment

### For Production Servers:
1. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn main:app
   ```

2. Set up a reverse proxy with Nginx
3. Use environment variables for sensitive data
4. Enable HTTPS with SSL certificates

### Environment Variables for Production:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: A secure random secret key
- `FLASK_ENV`: Set to "production"


#!/bin/bash

echo "=== Sentiment Analysis Dashboard Deployment ==="

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build React app
echo "Building React frontend..."
npm run build

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Download NLTK data
echo "Downloading NLTK data..."
python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('punkt'); nltk.download('stopwords')"

echo "=== Deployment completed! ==="
echo ""
echo "To run the application:"
echo "1. Set your OpenAI API key:"
echo "   export OPENAI_API_KEY='your-openai-api-key-here'"
echo ""
echo "2. Start the Flask server:"
echo "   python main.py"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:5000"
echo ""
echo "Note: Make sure you have a CSV file with 'Reviews' column to test the app."

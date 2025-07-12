
#!/bin/bash
echo "Starting Sentiment Analysis Dashboard..."
echo

echo "Activating virtual environment..."
source venv/bin/activate

echo
echo "Installing/updating dependencies..."
pip install -r requirements.txt
npm install

echo
echo "Building React frontend..."
npm run build

echo
echo "Starting Flask server..."
echo "Open your browser to: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo
python main.py

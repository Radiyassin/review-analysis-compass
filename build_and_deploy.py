
#!/usr/bin/env python3
import os
import subprocess
import shutil

def build_frontend():
    """Build the React frontend"""
    print("Building React frontend...")
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Build failed: {result.stderr}")
        return False
    print("Frontend build completed successfully!")
    return True

def setup_flask_static():
    """Copy built files to Flask static directory"""
    print("Setting up Flask static files...")
    
    # Remove old dist folder if exists
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    
    # Copy build files to dist
    if os.path.exists('dist'):
        shutil.copytree('dist', 'dist')
    
    print("Flask static setup completed!")

def install_python_deps():
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    deps = [
        'flask',
        'flask-cors',
        'pandas',
        'nltk',
        'openai',
        'numpy'
    ]
    
    for dep in deps:
        subprocess.run(['pip', 'install', dep])
    
    print("Python dependencies installed!")

if __name__ == "__main__":
    print("=== Building Sentiment Analysis Dashboard ===")
    
    # Install Python dependencies
    install_python_deps()
    
    # Build frontend
    if build_frontend():
        setup_flask_static()
        print("\n=== Build completed successfully! ===")
        print("To run the application:")
        print("1. Set your OpenAI API key: export OPENAI_API_KEY='your-key-here'")
        print("2. Run: python main.py")
        print("3. Open: http://localhost:5000")
    else:
        print("Build failed!")

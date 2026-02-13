import subprocess
import sys
import time
import webbrowser
import threading
import os

def start_backend():
    """Start the FastAPI backend server"""
    print("Starting FastAPI backend server...")
    try:
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\nBackend server stopped.")
    except Exception as e:
        print(f"Error starting backend: {e}")

def start_frontend():
    """Start the frontend HTTP server"""
    print("Starting frontend server...")
    try:
        subprocess.run([sys.executable, "-m", "http.server", "8080"], check=True)
    except KeyboardInterrupt:
        print("\nFrontend server stopped.")
    except Exception as e:
        print(f"Error starting frontend: {e}")

def main():
    print("Food Freshness Detection System")
    print("=" * 40)
    
    # Check if required files exist
    required_files = ["main.py", "index.html", "food_detection_model.keras"]
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"Error: Missing required files: {missing_files}")
        return
    
    print("Starting servers...")
    print("Backend will run on: http://127.0.0.1:8000")
    print("Frontend will run on: http://localhost:8080")
    print("Press Ctrl+C to stop both servers")
    print("-" * 40)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(3)
    
    # Start frontend
    start_frontend()

if __name__ == "__main__":
    main()

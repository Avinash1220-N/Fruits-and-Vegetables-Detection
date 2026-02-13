import requests
import os
from PIL import Image
import numpy as np

def test_api():
    # Test health endpoint
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print("Health check response:", response.json())
    except Exception as e:
        print(f"Health check failed: {e}")
        return

    # Find a test image from the dataset
    test_image_path = None
    for root, dirs, files in os.walk("dataset/Test"):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                test_image_path = os.path.join(root, file)
                break
        if test_image_path:
            break
    
    if not test_image_path:
        print("No test image found in dataset/Test directory")
        return
    
    print(f"Using test image: {test_image_path}")
    
    # Test prediction endpoint
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post("http://127.0.0.1:8000/predict/", files=files)
            
        if response.status_code == 200:
            result = response.json()
            print("Prediction successful!")
            print(f"Filename: {result['filename']}")
            print(f"Prediction: {result['prediction']}")
            print(f"Confidence: {result['confidence']}")
            print(f"Raw confidence: {result['raw_confidence']}")
            print(f"Class index: {result['class_index']}")
            print(f"All probabilities: {result['all_probabilities']}")
        else:
            print(f"Prediction failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_api()

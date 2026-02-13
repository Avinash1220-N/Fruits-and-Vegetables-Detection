import requests
import os

def simple_test():
    print("Testing API step by step...")
    
    # Test 1: Health endpoint
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print(f"Health check status: {response.status_code}")
        if response.status_code == 200:
            print("Health check passed")
        else:
            print(f"Health check failed: {response.text}")
            return
    except Exception as e:
        print(f"Health check error: {e}")
        return
    
    # Test 2: Find a test image
    test_image_path = None
    for root, dirs, files in os.walk("dataset/Test"):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                test_image_path = os.path.join(root, file)
                break
        if test_image_path:
            break
    
    if not test_image_path:
        print("No test image found")
        return
    
    print(f"Using test image: {test_image_path}")
    
    # Test 3: Try to upload the image
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': (os.path.basename(test_image_path), f, 'image/png')}
            print("Sending request...")
            response = requests.post("http://127.0.0.1:8000/predict/", files=files)
            
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("Success!")
            print(f"Result: {result}")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Request error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test()

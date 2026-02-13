import tensorflow as tf
import numpy as np
from PIL import Image
import os

def test_model_directly():
    print("Testing model directly...")
    
    # Load the model
    try:
        model = tf.keras.models.load_model('food_detection_model.keras')
        print("Model loaded successfully")
        print("Model summary:")
        model.summary()
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    # Find a test image
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
    
    try:
        # Load and preprocess image
        image = Image.open(test_image_path).convert('RGB')
        image = image.resize((64, 64))
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0
        
        print(f"Image shape: {img_array.shape}")
        print(f"Image min/max: {img_array.min()}/{img_array.max()}")
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        print(f"Predictions shape: {predictions.shape}")
        print(f"Predictions: {predictions[0]}")
        
        # Get class with highest probability
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index]) * 100
        
        print(f"Predicted class index: {predicted_class_index}")
        print(f"Confidence: {confidence:.2f}%")
        
        # Define class labels
        class_labels = [
            'freshapples', 'freshbanana', 'freshbittergroud', 'freshcapsicum', 
            'freshcucumber', 'freshokra', 'freshoranges', 'freshpotato', 'freshtomato',
            'rottenapples', 'rottenbanana', 'rottenbittergroud', 'rottencapsicum', 
            'rottencucumber', 'rottenokra', 'rottenoranges', 'rottenpotato', 'rottentomato'
        ]
        
        if predicted_class_index < len(class_labels):
            predicted_class = class_labels[predicted_class_index]
            print(f"Predicted class: {predicted_class}")
        else:
            print(f"Invalid class index: {predicted_class_index}")
            
    except Exception as e:
        print(f"Error during prediction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_model_directly()

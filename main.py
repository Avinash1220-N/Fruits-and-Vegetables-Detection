from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import io
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Food Freshness Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:8080"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved Keras model
try:
    model = tf.keras.models.load_model('food_detection_model.keras')
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

# Define the class labels based on the dataset structure
# The model was trained on 18 classes (9 fresh + 9 rotten categories)
class_labels = [
    'freshapples', 'freshbanana', 'freshbittergroud', 'freshcapsicum', 
    'freshcucumber', 'freshokra', 'freshoranges', 'freshpotato', 'freshtomato',
    'rottenapples', 'rottenbanana', 'rottenbittergroud', 'rottencapsicum', 
    'rottencucumber', 'rottenokra', 'rottenoranges', 'rottenpotato', 'rottentomato'
]

@app.get("/")
async def root():
    return {"message": "Food Freshness Detection API is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": "food_detection_model.keras",
        "num_classes": len(class_labels),
        "classes": class_labels
    }

@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please check the backend setup.")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        logger.info(f"Processing image: {file.filename}, size: {file.size}, type: {file.content_type}")
        
        # 1. Read and preprocess the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Resize to the target size (64x64) and convert to a NumPy array
        img = image.resize((64, 64))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        
        # Add a batch dimension and normalize the pixel values
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # Normalize to [0, 1] as per your training code
        
        logger.info(f"Image preprocessed successfully. Shape: {img_array.shape}")
        
        # 2. Make a prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Get the class with the highest probability
        predicted_class_index = np.argmax(predictions[0])
        predicted_class_name = class_labels[predicted_class_index]
        confidence = float(predictions[0][predicted_class_index]) * 100
        
        # Determine if it's fresh or rotten based on the class name
        is_fresh = predicted_class_name.startswith('fresh')
        freshness_status = "Fresh" if is_fresh else "Rotten"
        
        # Extract the food item name
        food_item = predicted_class_name.replace('fresh', '').replace('rotten', '')
        
        logger.info(f"Prediction: {predicted_class_name} ({freshness_status}) with {confidence:.2f}% confidence")
        
        return {
            "filename": file.filename, 
            "prediction": freshness_status,
            "food_item": food_item,
            "full_class": predicted_class_name,
            "confidence": f"{confidence:.2f}%",
            "raw_confidence": confidence,
            "class_index": int(predicted_class_index),
            "all_probabilities": predictions[0].tolist()
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
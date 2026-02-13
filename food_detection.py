import cv2 as cv
import numpy as np
import os
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder

# Data directories
data_dir = r'C:\Users\nania\OneDrive\Desktop\Food detection\dataset\Test'
train_dir = r'C:\Users\nania\OneDrive\Desktop\Food detection\dataset\Train'

# Set up data generators with augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2  # Use 20% of training data as validation
)

test_datagen = ImageDataGenerator(rescale=1./255)

# Split Test dataset into training (80%) and validation (20%)
all_datagen = ImageDataGenerator(
    rescale=1./255,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2
)

# Flow from directory for training data
training_set = all_datagen.flow_from_directory(
    data_dir,  # Use Test directory for training
    target_size=(64, 64),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# Flow from directory for validation data
validation_set = all_datagen.flow_from_directory(
    data_dir,  # Use Test directory for validation
    target_size=(64, 64),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

# Flow from directory for test data
test_set = test_datagen.flow_from_directory(
    data_dir,
    target_size=(64, 64),
    batch_size=32,
    class_mode='categorical',
    shuffle=False  # Don't shuffle for evaluation
)

# Get number of classes
num_classes = len(training_set.class_indices)
print(f"Number of classes: {num_classes}")
print(f"Classes: {list(training_set.class_indices.keys())}")

# --- Model Architecture ---
classifier = Sequential()

# First Convolutional Layer
classifier.add(Conv2D(32, (3, 3), input_shape=(64, 64, 3), activation='relu'))
classifier.add(MaxPooling2D(pool_size=(2, 2)))

# Second Convolutional Layer
classifier.add(Conv2D(64, (3, 3), activation='relu'))
classifier.add(MaxPooling2D(pool_size=(2, 2)))

# Third Convolutional Layer (additional layer for more complex features)
classifier.add(Conv2D(128, (3, 3), activation='relu'))
classifier.add(MaxPooling2D(pool_size=(2, 2)))

# Flattening
classifier.add(Flatten())

# Fully Connected Layers
classifier.add(Dense(units=128, activation='relu'))
classifier.add(Dropout(0.5))  # Dropout for regularization
classifier.add(Dense(units=num_classes, activation='softmax'))  # Output layer with softmax for multiclass

# Model Summary
classifier.summary()

# Compile the model
classifier.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train the model
history = classifier.fit(
    training_set,
    steps_per_epoch=training_set.samples // training_set.batch_size,
    epochs=20,
    validation_data=validation_set,
    validation_steps=validation_set.samples // validation_set.batch_size
)
classifier.save('food_detection_model.keras')  # <-- Fix here

# Evaluate the model
test_loss, test_acc = classifier.evaluate(test_set, steps=test_set.samples // test_set.batch_size)
print(f"Test accuracy: {test_acc*100:.2f}%")

# Plot training history
plt.figure(figsize=(12, 6))

# Plot accuracy
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

# Plot loss
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()

# Generate predictions for classification report
predictions = classifier.predict(test_set, steps=test_set.samples // test_set.batch_size + 1)
y_pred = np.argmax(predictions, axis=1)

# Get true labels
y_true = test_set.classes

# Get class labels
class_labels = list(test_set.class_indices.keys())

# Print classification report
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=class_labels))

# Save the model
classifier.save('food_detection_model.keras')
print("Model saved as 'food_detection_model.keras'")


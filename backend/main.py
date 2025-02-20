from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import shutil
import uuid
from pathlib import Path
import uvicorn
from typing import List
import logging

# Initialize FastAPI app
app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model
model_path = Path("models/best.pt")  # Ensure this path is correct
if not model_path.exists():
    logging.error("❌ Model file not found! Ensure 'best.pt' exists in the models directory.")
    raise FileNotFoundError("Model file not found! Please check the path.")

model = YOLO(str(model_path))

# Class names based on your dataset
CLASS_NAMES = ["blade shape", "blade edges", "blunt edge", "edge damage", "shape damage"]

@app.post("/predict")
async def predict(images: List[UploadFile] = File(...)):
    if not images:
        raise HTTPException(status_code=400, detail="No image files received.")

    results = []

    for image in images:
        try:
            # Save image temporarily
            image_id = str(uuid.uuid4())
            temp_image_path = f"temp_{image_id}.jpg"
            with open(temp_image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            logging.info(f"📷 Image received: {image.filename}")

            # Run YOLOv8 inference
            yolo_results = model(temp_image_path)

            # Check classification
            is_damaged = False
            is_blade = False
            for result in yolo_results:
                for cls in result.boxes.cls.tolist():
                    class_name = CLASS_NAMES[int(cls)]
                    if class_name in ["blade shape", "blade edges"]:
                        is_blade = True  # Confirm image contains a blade
                    if class_name in ["blunt edge", "edge damage", "shape damage"]:
                        is_damaged = True

            if not is_blade:
                classification = "Not a blade"
            else:
                classification = "Damaged" if is_damaged else "Non-Defective"

            results.append({"id": image_id, "name": image.filename, "classification": classification})

            logging.info(f"✅ Classification: {image.filename} → {classification}")

            # Remove temporary image
            Path(temp_image_path).unlink()

        except Exception as e:
            logging.error(f"❌ Error processing image {image.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error processing image.")

    return {"results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.1", port=8000, reload=True)

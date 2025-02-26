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

# Updated class names based on dataset
CLASS_NAMES = [
    "blade", "blade edge", "blade shape", "blunt edge",
    "blade-edges", "edge damage", "shape damage", "blunt edge."
]

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

            blade_results = []  # List to store detected blades

            # Process each detection
            for result in yolo_results:
                boxes = result.boxes.xyxy.tolist()  # Bounding boxes
                classes = result.boxes.cls.tolist()  # Class labels

                blade_id = 1  # Blade counter

                for box, cls in zip(boxes, classes):
                    class_name = CLASS_NAMES[int(cls)]

                    if class_name == "blade":
                        is_damaged = False

                        # Check if the detected blade has any defects
                        for sub_cls in classes:
                            defect_class = CLASS_NAMES[int(sub_cls)]
                            if defect_class in ["blunt edge", "edge damage", "shape damage"]:
                                is_damaged = True

                        classification = "Damaged" if is_damaged else "Non-Defective"
                        blade_results.append({"Blade ID": blade_id, "Classification": classification})
                        blade_id += 1

            if not blade_results:
                results.append({"id": image_id, "name": image.filename, "classification": "Not a blade"})
            else:
                results.extend(blade_results)

            logging.info(f"✅ Processed {image.filename}: {blade_results}")

            # Remove temporary image
            Path(temp_image_path).unlink()

        except Exception as e:
            logging.error(f"❌ Error processing image {image.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error processing image.")

    return {"results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

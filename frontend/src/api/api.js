import axios from "axios";

const API_URL = "http://127.0.0.1:8000/predict"; // Use actual FastAPI endpoint

export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // API should return { result: "Damaged" }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

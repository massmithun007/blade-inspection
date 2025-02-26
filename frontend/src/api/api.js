import axios from "axios";

const API_URL = "http://127.0.0.1:8000/predict"; // FastAPI endpoint

export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("images", imageFile);  // ✅ Correct field name

  try {
    const response = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("API Response:", response.data); // ✅ Debugging step

    if (response.data && response.data.results) {
      return response.data.results; // ✅ Return array of results properly
    } else {
      console.error("Unexpected API response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return [];
  }
};

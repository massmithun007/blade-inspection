import { useState, useRef, useEffect } from "react";

export default function ImageUpload({ setResults }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  let mediaStream = null;

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Start Camera
  const startCamera = () => {
    setIsCameraActive(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  // Capture Image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera(); // Stop camera after capturing
    }, "image/jpeg");
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Send image to backend
  const handleUpload = async () => {
    if (!image) {
      alert("Please select or capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("images", image);

    console.log("📤 Uploading Image:", image.name);

try {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  console.log("🔍 Full Backend Response:", result);

  // Ensure results is an array before appending
  if (result && result.results) {
    setResults((prevResults) => [...prevResults, ...result.results]);
  } else {
    alert("Invalid response format from server.");
  }
} catch (error) {
  console.error("❌ Error uploading image:", error);
  alert("Error uploading image.");
}

    
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload or Capture an Image</h2>

      {/* File Upload Input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Camera Buttons */}
      <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2">
        Open Camera
      </button>

      {isCameraActive && (
        <div className="mt-4">
          <video ref={videoRef} autoPlay playsInline width="300" height="200"></video>
          <button onClick={captureImage} className="bg-green-500 text-white px-4 py-2 rounded-md mt-2">
            Capture Image
          </button>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} width="300" height="200" style={{ display: "none" }}></canvas>

      {/* Image Preview */}
      {preview && <img src={preview} alt="Preview" className="mt-4 rounded-md shadow" width="200" />}

      {/* Upload Button */}
      <button onClick={handleUpload} className="bg-purple-500 text-white px-4 py-2 rounded-md mt-4">
        Upload
      </button>
    </div>
  );
}

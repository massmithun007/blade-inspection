import { useState, useRef } from "react";

export default function ImageUpload({ setResults }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  let mediaStream = null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const startCamera = () => {
    setIsCameraActive(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select or capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("images", image);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.results) {
        setResults((prevResults) => [...prevResults, ...result.results]);
      } else {
        alert("Invalid response format from server.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image.");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="section-title">Upload or Capture an Image</h2>

      <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />

      <button onClick={startCamera} className="button">Open Camera</button>

      {isCameraActive && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline width="300" height="200"></video>
          <button onClick={captureImage} className="button">Capture Image</button>
        </div>
      )}

      <canvas ref={canvasRef} width="300" height="200" style={{ display: "none" }}></canvas>

      {preview && <img src={preview} alt="Preview" className="image-preview" width="200" />}

      <button onClick={handleUpload} className="button">Upload</button>
    </div>
  );
}

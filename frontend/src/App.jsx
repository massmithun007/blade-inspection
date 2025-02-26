import { useState } from "react";
import ImageUpload from "./components/ImageUpload.jsx";
import ResultsTable from "./components/ResultsTable.jsx";
import "./App.css";

export default function App() {
  const [results, setResults] = useState([]);

  return (
    <div className="container">
      <h1 className="title">🔍 Blade Inspection System</h1>

      <div className="upload-section">
        <ImageUpload setResults={setResults} />
      </div>

      <div className="results-section">
        <h2 className="subtitle">📝 Inspection Results</h2>
        <ResultsTable results={results} />
      </div>
    </div>
  );
}

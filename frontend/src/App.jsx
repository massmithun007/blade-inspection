import { useState } from "react";
import ImageUpload from "./components/ImageUpload.jsx";
import ResultsTable from "./components/ResultsTable.jsx";

export default function App() {
  const [results, setResults] = useState([]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Blade Inspection System</h1>
      <ImageUpload setResults={setResults} />
      <ResultsTable results={results} />
    </div>
  );
}

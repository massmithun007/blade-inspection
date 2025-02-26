export default function ResultsTable({ results }) {
  if (!results || results.length === 0) {
    return <p className="no-results">No results available.</p>;
  }

  return (
    <div className="results-container">
      <h2 className="section-title">Inspection Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Blade Number</th>
            <th>Classification</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{result.Classification || "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

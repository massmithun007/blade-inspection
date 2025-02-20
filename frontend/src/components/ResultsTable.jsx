export default function ResultsTable({ results }) {
  if (!results || results.length === 0) {
    return <p className="text-gray-500">No results available.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Inspection Results</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Blade Number</th>
            <th className="border border-gray-300 px-4 py-2">Classification</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2">
                {result.classification || "Unknown"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

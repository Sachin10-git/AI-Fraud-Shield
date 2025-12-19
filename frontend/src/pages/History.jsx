import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("history")) || [];

    // ✅ HARD DEDUPLICATION BY txn_id (LATEST WINS)
    const uniqueMap = new Map();
    raw.forEach((txn) => {
      if (txn.txn_id) {
        uniqueMap.set(txn.txn_id, txn);
      }
    });

    setHistory(Array.from(uniqueMap.values()));
  }, []);

  const clearHistory = () => {
    if (!window.confirm("Clear all transaction history?")) return;
    localStorage.removeItem("history");
    setHistory([]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Transaction History</h1>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded p-4 overflow-x-auto">
        {history.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No transactions yet
          </p>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="w-1/4 text-left py-2">Type</th>
                <th className="w-1/4 text-center py-2">Amount</th>
                <th className="w-1/4 text-center py-2">Anomaly Score</th>
                <th className="w-1/4 text-center py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {history.map((t) => (
                <tr
                  key={t.txn_id}
                  className="border-t border-gray-700 hover:bg-gray-700/40"
                >
                  <td className="py-2 text-left whitespace-nowrap">
                    {t.type}
                  </td>

                  <td className="py-2 text-center">
                    ₹{Number(t.amount).toLocaleString()}
                  </td>

                  <td className="py-2 text-center">
                    {t.anomaly_score?.toFixed(3)}
                  </td>

                  <td
                    className={`py-2 text-center font-semibold ${
                      Number(t.anomaly_score) > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {Number(t.anomaly_score) > 0
                      ? "Suspicious"
                      : "Normal"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

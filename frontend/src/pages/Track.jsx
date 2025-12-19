import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const deduplicateByTxnId = (transactions) => {
  const map = new Map();
  transactions.forEach((t) => {
    if (t.txn_id) {
      map.set(t.txn_id, t); // latest wins
    }
  });
  return Array.from(map.values());
};

export default function Track() {
  const [transactions, setTransactions] = useState([]);
  const [labels, setLabels] = useState([]);
  const [normalData, setNormalData] = useState([]);
  const [suspiciousData, setSuspiciousData] = useState([]);

  const TRANSACTION_TYPES = [
    "TRANSFER",
    "PAYMENT",
    "CASH_OUT",
    "CASH_IN",
  ];

  useEffect(() => {
    const loadData = () => {
      const raw = JSON.parse(localStorage.getItem("history")) || [];

      const unique = deduplicateByTxnId(raw);

      const latest = unique.slice(0, 20);
      setTransactions(latest);

      const typeMap = {};
      TRANSACTION_TYPES.forEach((t) => {
        typeMap[t] = { normal: 0, suspicious: 0 };
      });

      latest.forEach((t) => {
        if (!typeMap[t.type]) return;

        Number(t.anomaly_score) > 0
          ? typeMap[t.type].suspicious++
          : typeMap[t.type].normal++;
      });

      setLabels(TRANSACTION_TYPES);
      setNormalData(
        TRANSACTION_TYPES.map((t) => typeMap[t].normal)
      );
      setSuspiciousData(
        TRANSACTION_TYPES.map((t) => typeMap[t].suspicious)
      );
    };

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const suspiciousCount = transactions.filter(
    (t) => Number(t.anomaly_score) > 0
  ).length;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Normal Transactions",
        data: normalData,
        backgroundColor: "#22c55e",
      },
      {
        label: "Suspicious Transactions",
        data: suspiciousData,
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">
        Fraud Tracking
      </h1>

      {/* Bar Graph */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Transaction Type vs Fraud Distribution
        </h2>

        {labels.length > 0 ? (
          <Bar data={chartData} />
        ) : (
          <p className="text-gray-400 text-sm">
            No transactions yet
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-gray-400">Total Transactions</p>
          <p className="text-xl font-bold">
            {transactions.length}
          </p>
        </div>

        <div className="bg-red-900 p-4 rounded">
          <p className="text-gray-300">
            Suspicious Transactions
          </p>
          <p className="text-xl font-bold">
            {suspiciousCount}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded p-4 overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="w-1/4 text-left py-2">Type</th>
              <th className="w-1/4 text-center py-2">Amount</th>
              <th className="w-1/4 text-center py-2">Score</th>
              <th className="w-1/4 text-center py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
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
      </div>
    </div>
  );
}

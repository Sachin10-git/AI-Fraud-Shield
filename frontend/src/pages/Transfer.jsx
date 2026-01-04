import { useState, useRef } from "react";
import { predictTransaction } from "../services/api";

export default function Transfer() {
  const [form, setForm] = useState({
    type: "TRANSFER",
    amount: "",
    oldbalanceOrg: "",
    newbalanceOrg: "",
    oldbalanceDest: "",
    newbalanceDest: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inFlightRef = useRef(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const analyzeTransaction = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      txn_id: crypto.randomUUID(),
      step: Math.floor(Date.now() / 1000),
      type: form.type,
      amount: Number(form.amount),
      oldbalanceOrg: Number(form.oldbalanceOrg),
      newbalanceOrg: Number(form.newbalanceOrg),
      oldbalanceDest: Number(form.oldbalanceDest),
      newbalanceDest: Number(form.newbalanceDest),
      origin: "USER",
      destination: "MERCHANT",
    };

    try {
      const res = await predictTransaction(payload);

      // ✅ BUILD FINAL TRANSACTION OBJECT
      const transaction = {
        ...payload,
        anomaly_score: res.anomaly_score,
        predicted_anomaly: res.predicted_anomaly,
        timestamp: new Date().toISOString(),
      };

      // ✅ SAVE TO LOCAL STORAGE (THIS WAS MISSING)
      const history = JSON.parse(localStorage.getItem("history")) || [];

      // prevent duplicates
      if (!history.some((t) => t.txn_id === transaction.txn_id)) {
        history.unshift(transaction);
        localStorage.setItem("history", JSON.stringify(history));
      }

      setResult(transaction);
    } catch {
      setError("Transaction analysis failed");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Transaction Analysis
      </h2>

      {error && (
        <div className="bg-red-900 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Transaction Type */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">
          Transaction Type
        </label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
        >
          <option>TRANSFER</option>
          <option>PAYMENT</option>
          <option>CASH_OUT</option>
          <option>CASH_IN</option>
        </select>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-1">
          Transaction Amount (₹)
        </label>
        <input
          name="amount"
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
        />
      </div>

      {/* Sender */}
      <div className="border border-gray-700 rounded-lg p-4 mb-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          Sender Account
        </h3>
        <div className="space-y-3">
          <input
            name="oldbalanceOrg"
            placeholder="Old Balance (Sender)"
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
          <input
            name="newbalanceOrg"
            placeholder="New Balance (Sender)"
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Receiver */}
      <div className="border border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">
          Receiver Account
        </h3>
        <div className="space-y-3">
          <input
            name="oldbalanceDest"
            placeholder="Old Balance (Receiver)"
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
          <input
            name="newbalanceDest"
            placeholder="New Balance (Receiver)"
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={analyzeTransaction}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
      >
        {loading ? "Analyzing..." : "Analyze Transaction"}
      </button>

      {result && (
        <div className="mt-6 text-center">
          <p
            className={`font-bold text-lg ${
              result.anomaly_score > 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {result.anomaly_score > 0
              ? "Suspicious Transaction"
              : "Normal Transaction"}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Anomaly Score:{" "}
            <span className="font-semibold">
              {result.anomaly_score.toFixed(4)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

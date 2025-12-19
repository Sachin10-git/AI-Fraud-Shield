import { useState, useRef } from "react";
import { predictTransaction } from "../services/api";

export default function Transfer() {
  const [form, setForm] = useState({
    type: "TRANSFER",
    amount: "",
    oldbalanceOrg: "",
    oldbalanceDest: "",
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

    const txnId = crypto.randomUUID();

    const amount = Number(form.amount);
    const oldbalanceOrg = Number(form.oldbalanceOrg);
    const oldbalanceDest = Number(form.oldbalanceDest || 0);

    if (amount <= 0 || oldbalanceOrg <= 0) {
      setError("Amount and balance must be positive");
      setLoading(false);
      inFlightRef.current = false;
      return;
    }

    const payload = {
      txn_id: txnId,
      step: Math.floor(Date.now() / 1000),
      type: form.type,
      amount,
      oldbalanceOrg,
      newbalanceOrg:
        form.type === "CASH_IN"
          ? oldbalanceOrg + amount
          : oldbalanceOrg - amount,
      oldbalanceDest,
      newbalanceDest:
        form.type === "CASH_IN"
          ? oldbalanceDest - amount
          : oldbalanceDest + amount,
      origin: "USER",
      destination: "MERCHANT",
    };

    try {
      const res = await predictTransaction(payload);

      const transaction = {
        ...payload,
        ...res,
        timestamp: new Date().toISOString(),
      };

      setResult(transaction);

      const history = JSON.parse(localStorage.getItem("history")) || [];

      if (!history.some((h) => h.txn_id === txnId)) {
        history.unshift(transaction);
        localStorage.setItem("history", JSON.stringify(history));
      }

    } catch (err) {
      setError("Transaction analysis failed");
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div className="max-w-md bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">
        Transfer / Receive
      </h2>

      {result?.anomaly_score > 0 && (
        <div className="bg-red-900 text-red-300 p-3 rounded mb-4">
          ⚠️ Suspicious transaction detected
        </div>
      )}

      {error && (
        <div className="bg-red-900 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
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

        <input
          name="amount"
          placeholder="Amount (₹)"
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
        />

        <input
          name="oldbalanceOrg"
          placeholder="Your Balance"
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
        />

        <input
          name="oldbalanceDest"
          placeholder="Other Party Balance"
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
        />

        <button
          onClick={analyzeTransaction}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold w-full"
        >
          {loading ? "Analyzing..." : "Analyze Transaction"}
        </button>

        {result && (
          <div className="mt-4 text-center">
            <p
              className={`font-bold ${
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
    </div>
  );
}

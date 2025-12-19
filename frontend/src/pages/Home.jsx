import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";

const deduplicateByTxnId = (transactions) => {
  const map = new Map();
  transactions.forEach((t) => {
    if (t.txn_id) {
      map.set(t.txn_id, t);
    }
  });
  return Array.from(map.values());
};

export default function Home() {
  const [estimatedAffected, setEstimatedAffected] = useState(0);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  const navigate = useNavigate();
  const ANOMALY_THRESHOLD = 0.0;

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("history")) || [];
    const history = deduplicateByTxnId(raw);

    const suspiciousTxns = history.filter(
      (t) => Number(t.anomaly_score) > ANOMALY_THRESHOLD
    );

    const affectedAmount = suspiciousTxns.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    setEstimatedAffected(affectedAmount);
    setSuspiciousCount(suspiciousTxns.length);
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Fraud</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Estimated Affected Amount"
          value={`₹${estimatedAffected.toLocaleString("en-IN", {
          minimumFractionDigits: 2,maximumFractionDigits: 2,})}`}
          subtitle="Total suspicious transaction amount"
        />

        <StatCard
          title="Suspicious Transactions"
          value={suspiciousCount}
          subtitle="Model-detected anomalies"
        />
      </div>

      {/* Proactive Fraud */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Proactive Fraud Management
        </h2>

        <div className="space-y-4">
          <div
            className="cursor-pointer"
            onClick={() => navigate("/transfer")}
          >
            <FeatureCard
              title="Anomaly Alert"
              description="High-risk transactions detected using anomaly scores"
            />
          </div>

          <div
            className="cursor-pointer"
            onClick={() => navigate("/track")}
          >
            <FeatureCard
              title="Fraud Tracking"
              description="Comparison between normal and suspicious transactions"
            />
          </div>

          <div
            className="cursor-pointer"
            onClick={() => navigate("/history")}
          >
            <FeatureCard
              title="Transactional History"
              description="Complete log of analyzed transactions"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

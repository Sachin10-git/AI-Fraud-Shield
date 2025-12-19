const BASE_URL = "http://127.0.0.1:8000";

export async function predictTransaction(payload) {
  const response = await fetch(`${BASE_URL}/api/model/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Prediction failed");
  }

  const data = await response.json();

  // SAVE TO LOCAL STORAGE FOR TRACK PAGE
  const history = JSON.parse(localStorage.getItem("history")) || [];

  history.unshift({
    type: payload.type,
    amount: payload.amount,
    anomaly_score: data.anomaly_score,
    predicted_anomaly: data.predicted_anomaly,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem("history", JSON.stringify(history));

  return data;
}

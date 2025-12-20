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

  return await response.json();
}

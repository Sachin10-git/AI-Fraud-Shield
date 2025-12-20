const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

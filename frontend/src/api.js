const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

export async function fetchMetrics() {
  const response = await fetch(`${API_BASE_URL}/metrics`);
  if (!response.ok) throw new Error("Unable to load dashboard metrics.");
  return response.json();
}

export async function fetchBatteries() {
  const response = await fetch(`${API_BASE_URL}/batteries`);
  if (!response.ok) throw new Error("Unable to load battery results.");
  return response.json();
}

export async function uploadBatteryCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.detail || "Prediction failed.");
  }
  return payload;
}

export async function getPassport(batteryId) {
  const response = await fetch(
    `${API_BASE_URL}/passport/${batteryId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch passport");
  }

  return response.json();
}
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getApiKey() {
  return localStorage.getItem("sentinel_api_key");
}

export async function getLogs() {
  const res = await fetch(`${API_URL}/logs`, {
    headers: {
      "x-api-key": getApiKey(),
    },
  });
  return res.json();
}

export async function getAlerts() {
  const res = await fetch(`${API_URL}/alerts`, {
    headers: {
      "x-api-key": getApiKey(),
    },
  });
  return res.json();
}

export async function clearLogs() {
  const res = await fetch(`${API_URL}/logs`, {
    method: "DELETE",
    headers: {
      "x-api-key": getApiKey(),
    },
  });
  return res.json();
}

export async function validateKey(apiKey) {
  const res = await fetch(`${API_URL}/logs`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  return res.ok;
}

export async function createApiKey(name) {
  const res = await fetch(`${API_URL}/api-keys?name=${encodeURIComponent(name)}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create API key");
  }

  return res.json();
}

export { API_URL };
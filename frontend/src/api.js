const BASE = "http://127.0.0.1:8000";

function getKey() {
  return localStorage.getItem("sentinel_api_key") || "";
}

function headers() {
  return {
    "Content-Type": "application/json",
    "x-api-key": getKey(),
  };
}

export async function createApiKey(name) {
  const res = await fetch(`${BASE}/api-keys?name=${encodeURIComponent(name)}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create API key");
  }

  return res.json();
}

export async function validateKey(key) {
  const res = await fetch(`${BASE}/logs`, {
    headers: {
      "x-api-key": key,
    },
  });

  return res.ok;
}

export async function getLogs() {
  const res = await fetch(`${BASE}/logs`, {
    headers: headers(),
  });

  if (!res.ok) return [];

  return res.json();
}

export async function getAlerts() {
  const res = await fetch(`${BASE}/alerts`, {
    headers: headers(),
  });

  if (!res.ok) return [];

  return res.json();
}

export async function clearLogs() {
  const res = await fetch(`${BASE}/logs`, {
    method: "DELETE",
    headers: headers(),
  });

  return res.json();
}
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getLogs = async () => {
  const res = await axios.get(`${API_URL}/logs`);
  return res.data;
};

export const getAlerts = async () => {
  const res = await axios.get(`${API_URL}/alerts`);
  return res.data;
};

export const clearLogs = async () => {
  const res = await axios.delete(`${API_URL}/logs`);
  return res.data;
};
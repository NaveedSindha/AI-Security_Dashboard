import os
import joblib
from datetime import datetime

MODEL_PATH = "ml/model.pkl"

model = None

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)


def extract_features(log):
    hour = datetime.fromisoformat(log["timestamp"].replace("Z", "+00:00")).hour

    failed_login = 1 if log["status"] == "failed" else 0

    high_risk_endpoint = 1 if log["endpoint"] in [
        "/admin",
        "/settings",
        "/api/keys"
    ] else 0

    suspicious_user_agent = 1 if any(
        agent in log["user_agent"].lower()
        for agent in ["curl", "python", "bot", "scraper"]
    ) else 0

    suspicious_country = 1 if log["country"] in [
        "North Korea",
        "Russia",
        "Unknown"
    ] else 0

    return [[
        failed_login,
        high_risk_endpoint,
        suspicious_user_agent,
        suspicious_country,
        hour
    ]]


def detect_ml_anomaly(log):
    if model is None:
        return {
            "ml_anomaly": False,
            "ml_score": 0,
            "ml_reason": "ML model not loaded"
        }
    
    features = extract_features(log)
    prediction = model.predict(features)[0]
    raw_score = model.decision_function(features)[0]
    
    ml_anomaly = bool(prediction == -1)          # ✅ convert numpy.bool to Python bool
    ml_score = int(max(0, min(100, (0.2 - float(raw_score)) * 300)))  # ✅ convert numpy.float to Python float

    return {
        "ml_anomaly": ml_anomaly,
        "ml_score": ml_score,
        "ml_reason": "ML detected unusual behavior pattern" if ml_anomaly else "ML considered behavior normal"
    }
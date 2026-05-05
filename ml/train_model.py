import random
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime

MODEL_PATH = "ml/model.pkl"

countries = ["Canada", "USA", "Germany", "Russia", "North Korea", "Unknown"]
endpoints = ["/home", "/login", "/admin", "/settings", "/api/keys"]
user_agents = [
    "Mozilla/5.0",
    "Chrome/120.0",
    "Safari/605.1.15",
    "curl/7.88.1",
    "python-requests/2.31.0",
    "bot-scraper"
]


def create_sample_log():
    return {
        "status": random.choices(["success", "failed"], weights=[80, 20])[0],
        "endpoint": random.choices(endpoints, weights=[45, 25, 10, 10, 10])[0],
        "country": random.choices(countries, weights=[45, 25, 15, 7, 5, 3])[0],
        "user_agent": random.choices(user_agents, weights=[40, 25, 20, 7, 5, 3])[0],
        "timestamp": datetime.utcnow().isoformat()
    }


def extract_features(log):
    hour = datetime.fromisoformat(log["timestamp"]).hour

    return [
        1 if log["status"] == "failed" else 0,
        1 if log["endpoint"] in ["/admin", "/settings", "/api/keys"] else 0,
        1 if any(agent in log["user_agent"].lower() for agent in ["curl", "python", "bot", "scraper"]) else 0,
        1 if log["country"] in ["North Korea", "Russia", "Unknown"] else 0,
        hour
    ]


logs = [create_sample_log() for _ in range(1000)]
features = [extract_features(log) for log in logs]

df = pd.DataFrame(
    features,
    columns=[
        "failed_login",
        "high_risk_endpoint",
        "suspicious_user_agent",
        "suspicious_country",
        "hour"
    ]
)

model = IsolationForest(
    n_estimators=100,
    contamination=0.15,
    random_state=42
)

model.fit(df)

joblib.dump(model, MODEL_PATH)

print(f"Model trained and saved to {MODEL_PATH}")
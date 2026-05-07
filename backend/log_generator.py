# backend/log_generator.py

import os
import requests
import random
import time
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
URL = f"{BACKEND_URL}/logs"

API_KEY = os.getenv("SENTINEL_API_KEY")

if not API_KEY:
    raise RuntimeError("SENTINEL_API_KEY is not set")

users = ["admin", "user1", "guest", "naveed"]
countries = ["Canada", "USA", "Germany", "Russia", "North Korea"]
endpoints = ["/home", "/login", "/admin", "/settings", "/api/keys"]
user_agents = [
    "Mozilla/5.0",
    "Chrome/120.0",
    "Safari/605.1.15",
    "curl/7.88.1",
    "python-requests/2.31.0"
]

def generate_log():
    return {
        "user": random.choice(users),
        "ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
        "country": random.choice(countries),
        "status": random.choice(["success", "failed"]),
        "endpoint": random.choice(endpoints),
        "user_agent": random.choice(user_agents),
        "timestamp": datetime.utcnow().isoformat()
    }

while True:
    log = generate_log()

    try:
        response = requests.post(
            URL,
            json=log,
            headers={"x-api-key": API_KEY}
        )

        print(log, response.json())

    except Exception as e:
        print("Error:", e)

    time.sleep(1)
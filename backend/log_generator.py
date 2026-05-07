# backend/log_generator.py

import requests
import random
import time
from datetime import datetime

URL = "http://127.0.0.1:8000/logs"

API_KEY = "sk-sentinel-htgiHL0gR8FKZ2KF36ImRJxGHT6TW80P"

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
            headers={
                "x-api-key": API_KEY
            }
        )

        print(log, response.json())

    except Exception as e:
        print("Error:", e)

    time.sleep(1)
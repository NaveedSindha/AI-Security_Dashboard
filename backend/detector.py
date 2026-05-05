def detect_anomaly(log):
    risk_score = 0
    reasons = []

    if log["status"] == "failed":
        risk_score += 25
        reasons.append("Failed login")

    if log["endpoint"] in ["/admin", "/settings", "/api/keys"]:
        risk_score += 30
        reasons.append(f"High-risk endpoint: {log['endpoint']}")

    suspicious_agents = ["curl", "python", "bot", "scraper"]
    if any(agent in log["user_agent"].lower() for agent in suspicious_agents):
        risk_score += 25
        reasons.append("Suspicious user agent")

    suspicious_countries = ["North Korea", "Russia", "Unknown"]
    if log["country"] in suspicious_countries:
        risk_score += 20
        reasons.append(f"Suspicious country: {log['country']}")

    is_anomaly = risk_score >= 50

    return {
        "is_anomaly": is_anomaly,
        "risk_score": min(risk_score, 100),
        "reasons": reasons
    }
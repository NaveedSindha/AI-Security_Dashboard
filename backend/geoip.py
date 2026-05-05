import requests

def get_geo(ip: str):
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = response.json()
        if data["status"] == "success":
            return {
                "country": data.get("country", "Unknown"),
                "city": data.get("city", "Unknown"),
                "latitude": data.get("lat", 0.0),
                "longitude": data.get("lon", 0.0),
            }
    except Exception:
        pass
    return {
        "country": "Unknown",
        "city": "Unknown",
        "latitude": 0.0,
        "longitude": 0.0,
    }
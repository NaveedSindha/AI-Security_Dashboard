import requests

_cache = {}

def get_geo(ip: str):
    if ip in _cache:
        return _cache[ip]

    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = response.json()
        if data["status"] == "success":
            result = {
                "country": data.get("country", "Unknown"),
                "city": data.get("city", "Unknown"),
                "latitude": data.get("lat", 0.0),
                "longitude": data.get("lon", 0.0),
            }
            _cache[ip] = result
            return result
    except Exception:
        pass

    result = {
        "country": "Unknown",
        "city": "Unknown",
        "latitude": 0.0,
        "longitude": 0.0,
    }
    _cache[ip] = result
    return result
from sentinelai import Sentinel
import time

sentinel = Sentinel(api_key="sk-sentinel-NuI2f0hBghkk60MKw1gQUfQHv5CCcyK8")

# Simulate some real looking traffic
sentinel.log(user="alice", ip="185.220.101.45", status="failed", endpoint="/admin", user_agent="curl/7.88")
sentinel.log(user="bob", ip="8.8.8.8", status="success", endpoint="/home", user_agent="Mozilla/5.0")
sentinel.log(user="alice", ip="185.220.101.45", status="failed", endpoint="/api/keys", user_agent="python-requests")

time.sleep(2)  # wait for background threads
print("Done — check your dashboard!")
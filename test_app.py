from flask import Flask, request, jsonify
from sentinelai import Sentinel

app = Flask(__name__)

# Point it at your running backend with your API key
sentinel = Sentinel(api_key="sk-sentinel-CHKTxdy28vdRmTHHnCFSkfRjgUQSAokf")
sentinel.flask_middleware(app)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to my store!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if data.get("password") == "correct":
        return jsonify({"status": "success", "token": "abc123"})
    return jsonify({"status": "failed"}), 401

@app.route("/admin")
def admin():
    return jsonify({"message": "Admin panel"})

@app.route("/api/keys")
def api_keys():
    return jsonify({"keys": ["key1", "key2"]})

@app.route("/settings")
def settings():
    return jsonify({"theme": "dark"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
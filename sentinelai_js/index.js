const axios = require("axios");

class Sentinel {
  constructor({ apiKey, host = "http://127.0.0.1:8000" }) {
    this.apiKey = apiKey;
    this.host = host;
  }

  log({ user, ip, status, endpoint, userAgent = "unknown" }) {
    const payload = {
      user: user || "anonymous",
      ip: ip || "0.0.0.0",
      country: "Unknown",
      status: status,
      endpoint: endpoint,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    };

    // Fire and forget — doesn't slow down your app
    axios
      .post(`${this.host}/logs`, payload, {
        headers: { "x-api-key": this.apiKey },
        timeout: 5000,
      })
      .catch((err) => console.error("[SentinelAI] Failed to send log:", err.message));
  }

  // Express middleware — add one line to monitor everything
  middleware() {
    const sentinel = this;
    return function (req, res, next) {
      res.on("finish", () => {
        const status = res.statusCode < 400 ? "success" : "failed";
        sentinel.log({
          user: req.headers["x-user"] || req.user?.id || "anonymous",
          ip: req.ip || req.connection.remoteAddress || "0.0.0.0",
          status,
          endpoint: req.path,
          userAgent: req.headers["user-agent"] || "unknown",
        });
      });
      next();
    };
  }
}

module.exports = Sentinel;
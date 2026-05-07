import { useEffect, useState } from "react";
import { getLogs, getAlerts, clearLogs, validateKey, createApiKey } from "./api";
import AttackMap from "./AttackMap";
import "./App.css";

const DANGEROUS_ENDPOINTS = ["/admin", "/settings", "/api/keys"];

function getAvatarColor(user) {
  const map = { admin: "red", user1: "blue", guest: "green", naveed: "amber" };
  return map[user] || "blue";
}

function getRiskClass(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "med";
  return "low";
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "--:--:--";
  }
}

function ShieldIcon({ color = "white", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2L3 5.5V10C3 13.87 6.08 17.5 10 18C13.92 17.5 17 13.87 17 10V5.5L10 2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 10L9 12L13 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("sentinel_api_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [appName, setAppName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const scriptTag = `<script
  src="http://127.0.0.1:8000/static/sentinel.js"
  data-api-key="${generatedKey || apiKey || "YOUR_API_KEY_HERE"}"
></script>`;

  const fetchData = async () => {
    const logsData = await getLogs();
    const alertsData = await getAlerts();
    setLogs(logsData);
    setAlerts(alertsData);
  };

  useEffect(() => {
    if (!apiKey) return;

    fetchData();

    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, [apiKey]);

  const handleClear = async () => {
    await clearLogs();
    fetchData();
  };

  const handleLogin = async () => {
    setLoginError("");

    if (!keyInput.trim()) {
      setLoginError("Please enter an API key.");
      return;
    }

    setLoading(true);

    const isValid = await validateKey(keyInput.trim());

    setLoading(false);

    if (!isValid) {
      setLoginError("Invalid API key.");
      return;
    }

    localStorage.setItem("sentinel_api_key", keyInput.trim());
    setApiKey(keyInput.trim());
  };

  const handleGenerateKey = async () => {
    setLoginError("");

    if (!appName.trim()) {
      setLoginError("Please enter an app name.");
      return;
    }

    setLoading(true);

    try {
      const data = await createApiKey(appName.trim());
      setGeneratedKey(data.api_key);
      setKeyInput(data.api_key);
    } catch {
      setLoginError("Could not generate API key.");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sentinel_api_key");
    setApiKey("");
    setLogs([]);
    setAlerts([]);
  };

  const copyScriptTag = async () => {
    await navigator.clipboard.writeText(scriptTag);
  };

  const total = logs.length;
  const alertCount = alerts.length;
  const rate = total === 0 ? 0 : Math.round((alertCount / total) * 100);
  const clean = total - alertCount;

  if (!apiKey) {
    return (
      <div className="app">
        <div className="grid-bg" />

        <div className="login-wrap">
          <div className="login-card">
            <div className="login-logo">
              <div className="logo-icon">
                <ShieldIcon color="white" size={20} />
              </div>
            </div>

            <div className="login-title">SentinelAI</div>
            <div className="login-sub">CONNECT YOUR APP</div>

            <p className="login-desc">
              Monitor your website or backend by connecting it with a SentinelAI API key.
            </p>

            <div className="login-hint">
              Step 1: Generate an API key for your app.
              <br />
              Step 2: Paste the script tag into your website.
              <br />
              Step 3: Login here with the same key to view your dashboard.
            </div>

            <input
              className="login-input"
              placeholder="App name, example: my-portfolio-app"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />

            <button className="login-btn" onClick={handleGenerateKey} disabled={loading}>
              {loading ? "Generating..." : "Generate API Key"}
            </button>

            {generatedKey && (
              <div className="login-hint">
                Your new API key:
                <br />
                <code>{generatedKey}</code>
                <br />
                <br />
                Paste this script before the closing <code>{"</body>"}</code> tag in your website:
                <br />
                <br />
                <code>{scriptTag}</code>
                <br />
                <br />
                Then click Enter Dashboard.
              </div>
            )}

            <p className="login-desc">
              Already have a key? Paste it below.
            </p>

            <input
              className="login-input"
              placeholder="sk-sentinel-..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Checking..." : "Enter Dashboard"}
            </button>

            {loginError && <div className="login-error">{loginError}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="grid-bg" />
      <div className="wrap">
        <header>
          <div className="logo-area">
            <div className="logo-icon"><ShieldIcon color="white" size={20} /></div>
            <div>
              <div className="logo-text">SentinelAI</div>
              <div className="logo-sub">Security Operations Center</div>
            </div>
          </div>
          <div className="header-right">
            <div className="live-badge"><div className="live-dot" />LIVE</div>
            <button className="clear-btn" onClick={handleClear}>
              Clear Logs
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="panel" style={{ marginBottom: "16px" }}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" style={{ background: "#3b82f6" }} />
              Connect Your Website
            </div>
            <div className="panel-badge blue">Setup</div>
          </div>

          <div className="alerts-body">
            <div className="login-hint" style={{ textAlign: "left", width: "100%" }}>
              Paste this script before the closing <code>{"</body>"}</code> tag in your website.
              SentinelAI will automatically track page visits, JavaScript errors, failed requests,
              login attempts, and suspicious routes.
              <br />
              <br />
              <code>{scriptTag}</code>
            </div>

            <button className="login-btn" onClick={copyScriptTag}>
              Copy Script Tag
            </button>

            <div className="login-hint" style={{ textAlign: "left", width: "100%" }}>
              Python backend option:
              <br />
              <code>sentinel = Sentinel(api_key="{apiKey}")</code>
              <br />
              <code>app.add_middleware(sentinel.fastapi_middleware())</code>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card blue">
            <div className="stat-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="#3b82f6" strokeWidth="1.5" />
                <path d="M5 7h6M5 10h4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="stat-label">Total Logs</div>
            <div className="stat-value">{total}</div>
            <div className="stat-footer">events captured</div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L2 13h12L8 2z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 7v3M8 11.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">{alertCount}</div>
            <div className="stat-footer">anomalies detected</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M8 5v3l2 1" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="stat-label">Anomaly Rate</div>
            <div className="stat-value">{rate}%</div>
            <div className="stat-footer">threat ratio</div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon"><ShieldIcon color="#22c55e" size={16} /></div>
            <div className="stat-label">Clean Logs</div>
            <div className="stat-value">{clean}</div>
            <div className="stat-footer">safe requests</div>
          </div>
        </div>

        <AttackMap logs={logs} />

        <div className="content">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-title-dot" style={{ background: "#3b82f6" }} />
                Live Event Stream
              </div>
              <div className="panel-badge blue">{total} events</div>
            </div>
            <div className="panel-body">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Endpoint</th>
                    <th>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="6" className="empty-table-cell">Waiting for events...</td></tr>
                  ) : (
                    [...logs].reverse().map((log, i) => {
                      const rc = getRiskClass(log.risk_score);
                      const isDanger = DANGEROUS_ENDPOINTS.includes(log.endpoint);
                      const ac = getAvatarColor(log.user);
                      const initials = (log.user || "?").slice(0, 2).toUpperCase();

                      return (
                        <tr key={i} className={log.is_anomaly ? "anomaly" : ""}>
                          <td>
                            <div className="user-cell">
                              <div className={`avatar ${ac}`}>{initials}</div>
                              {log.user}
                            </div>
                          </td>
                          <td className="muted">{log.ip}</td>
                          <td>{log.country}</td>
                          <td>
                            <span className={`status-badge ${log.status === "success" ? "success" : "failed"}`}>
                              {log.status}
                            </span>
                          </td>
                          <td>
                            <span className={`endpoint-tag ${isDanger ? "danger" : ""}`}>
                              {log.endpoint}
                            </span>
                          </td>
                          <td>
                            <div className="risk-bar-wrap">
                              <div className="risk-bar">
                                <div className={`risk-fill ${rc}`} style={{ width: `${log.risk_score}%` }} />
                              </div>
                              <span className={`risk-num ${rc}`}>{log.risk_score}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-title-dot pulse" style={{ background: "#ef4444" }} />
                Security Alerts
              </div>
              <div className="panel-badge red">{alertCount} threats</div>
            </div>
            <div className="alerts-body">
              {alerts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><ShieldIcon color="#22c55e" size={20} /></div>
                  <div className="empty-title">All Clear</div>
                  <div className="empty-sub">No active threats detected</div>
                </div>
              ) : (
                [...alerts].reverse().map((a, i) => (
                  <div className="alert-card" key={i}>
                    <div className="alert-header">
                      <div className="alert-risk">RISK {a.risk_score}/100</div>
                      <div className="alert-time">{formatTime(a.timestamp)}</div>
                    </div>

                    <div className="alert-row">
                      <div className="alert-key">User</div>
                      <div className="alert-val">{a.user}</div>
                    </div>

                    <div className="alert-row">
                      <div className="alert-key">IP</div>
                      <div className="alert-val">{a.ip}</div>
                    </div>

                    <div className="alert-row">
                      <div className="alert-key">Endpoint</div>
                      <div className="alert-val">{a.endpoint}</div>
                    </div>

                    <div className="alert-row">
                      <div className="alert-key">Country</div>
                      <div className="alert-val">{a.country}</div>
                    </div>

                    <div className="alert-reasons">
                      {(typeof a.reasons === "string" ? a.reasons.split(", ") : a.reasons || []).map((r, j) => (
                        <span className="reason-tag" key={j}>{r}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
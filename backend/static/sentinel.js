(function () {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  const backendUrl = script?.getAttribute("data-host") || new URL(script.src).origin;
  let currentUser = localStorage.getItem("sentinel_user") || "anonymous";

  if (!apiKey) {
    console.warn("[SentinelAI] Missing data-api-key");
    return;
  }

  let realIP = "0.0.0.0";

  // Fetch real IP first then start tracking
  fetch(`${backendUrl}/my-ip`)
    .then(res => res.json())
    .then(data => {
      realIP = data.ip || "0.0.0.0";
      // Send page view after we have the real IP
      sendLog("success", window.location.pathname, "anonymous");
    })
    .catch(() => {
      sendLog("success", window.location.pathname, "anonymous");
    });

  function sendLog(status, endpoint, user) {
    fetch(`${backendUrl}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        user: user || currentUser || "anonymous",
        ip: realIP,
        country: "Unknown",
        status: status,
        endpoint: endpoint || window.location.pathname,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => { });
  }

  // JS errors
  window.addEventListener("error", function () {
    sendLog("failed", window.location.pathname + " [js-error]");
  });

  // Promise rejections
  window.addEventListener("unhandledrejection", function () {
    sendLog("failed", window.location.pathname + " [promise-rejection]", "anonymous");
  });

  // Failed fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    try {
      const response = await originalFetch(...args);
      if (response.status >= 400) {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "/unknown";
        const path = new URL(url, window.location.origin).pathname;
        sendLog("failed", path, "anonymous");
      }
      return response;
    } catch (error) {
      sendLog("failed", window.location.pathname + " [network-error]", "anonymous");
      throw error;
    }
  };

  // Manual logging — now includes real IP automatically
  window.SentinelAI = {
    identify: function (user) {
      currentUser = user;
      localStorage.setItem("sentinel_user", user);
    },

    log: function (status, endpoint, user) {
      sendLog(status, endpoint, user || currentUser);
    }
  };

  window.Sentinel = window.SentinelAI;

  // Auto-detect login form submissions
  document.addEventListener("submit", function (e) {
    const form = e.target;

    const passwordField = form.querySelector('input[type="password"]');

    if (!passwordField) return;

    const usernameField =
      form.querySelector('input[name="username"]') ||
      form.querySelector('input[name="email"]') ||
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[type="text"]');

    const username = usernameField?.value || "anonymous";

    sendLog("success", window.location.pathname + " [login-attempt]", username);

    setTimeout(() => {
      const pageText = document.body.innerText.toLowerCase();

      const failedIndicators = [
        "invalid",
        "incorrect",
        "wrong password",
        "login failed",
        "try again",
        "unauthorized",
        "not found"
      ];

      const failed = failedIndicators.some((text) =>
        pageText.includes(text)
      );

      if (failed) {
        sendLog("failed", window.location.pathname + " [failed-login]", username);
      }
    }, 1500);
  });

})();
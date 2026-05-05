import requests
import threading
from datetime import datetime


class Sentinel:
    def __init__(self, api_key: str, host: str = "http://127.0.0.1:8000"):
        self.api_key = api_key
        self.host = host

    def log(self, user: str, ip: str, status: str, endpoint: str, user_agent: str = "unknown"):
        payload = {
            "user": user,
            "ip": ip,
            "country": "Unknown",
            "status": status,
            "endpoint": endpoint,
            "user_agent": user_agent,
            "timestamp": datetime.utcnow().isoformat()
        }
        # Send in background so it doesn't slow down your app
        thread = threading.Thread(target=self._send, args=(payload,))
        thread.daemon = True
        thread.start()

    def _send(self, payload):
        try:
            requests.post(
                f"{self.host}/logs",
                json=payload,
                headers={"x-api-key": self.api_key},
                timeout=5
            )
        except Exception as e:
            print(f"[SentinelAI] Failed to send log: {e}")

    def fastapi_middleware(self):
        """Returns a FastAPI middleware function"""
        from starlette.middleware.base import BaseHTTPMiddleware
        from starlette.requests import Request

        sentinel = self

        class SentinelMiddleware(BaseHTTPMiddleware):
            async def dispatch(self, request: Request, call_next):
                response = await call_next(request)
                status = "success" if response.status_code < 400 else "failed"
                user = request.headers.get("x-user", "anonymous")
                ip = request.client.host if request.client else "0.0.0.0"
                sentinel.log(
                    user=user,
                    ip=ip,
                    status=status,
                    endpoint=str(request.url.path),
                    user_agent=request.headers.get("user-agent", "unknown")
                )
                return response

        return SentinelMiddleware

    def flask_middleware(self, app):
        """Automatically monitors all Flask routes"""
        from flask import request, g
        import time

        sentinel = self

        @app.before_request
        def before():
            g.sentinel_start = time.time()

        @app.after_request
        def after(response):
            status = "success" if response.status_code < 400 else "failed"
            user = request.headers.get("x-user", "anonymous")
            ip = request.remote_addr or "0.0.0.0"
            sentinel.log(
                user=user,
                ip=ip,
                status=status,
                endpoint=request.path,
                user_agent=request.headers.get("user-agent", "unknown")
            )
            return response

        return app
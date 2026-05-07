import secrets
import asyncio
from datetime import datetime

from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.detector import detect_anomaly
from ml.ml_detector import detect_ml_anomaly
from backend.database import engine, get_db, Base
from backend import models
from backend.alerting import send_email_alert
from backend.geoip import get_geo
from fastapi.staticfiles import StaticFiles
from fastapi import Request

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SentinelAI Security Monitoring")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")


class LogRequest(BaseModel):
    user: str = "anonymous"
    ip: str = "0.0.0.0"
    country: str = "Unknown"
    status: str = "success"
    endpoint: str = "/"
    user_agent: str = "unknown"
    timestamp: str = ""


def get_api_key_owner(
    x_api_key: str = Header(None),
    db: Session = Depends(get_db)
):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    valid_key = db.query(models.ApiKey).filter(
        models.ApiKey.key == x_api_key
    ).first()

    if not valid_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    return valid_key.name


@app.get("/")
def home():
    return {
        "message": "SentinelAI Security Monitoring 🚀",
        "routes": ["/logs", "/alerts", "/api-keys", "/docs"]
    }


@app.post("/api-keys")
def create_api_key(name: str, db: Session = Depends(get_db)):
    key = "sk-sentinel-" + secrets.token_urlsafe(24)

    db_key = models.ApiKey(
        key=key,
        name=name,
        created_at=datetime.utcnow().isoformat()
    )

    db.add(db_key)
    db.commit()

    return {"api_key": key, "name": name}


@app.get("/api-keys")
def list_api_keys(db: Session = Depends(get_db)):
    return db.query(models.ApiKey).all()


@app.delete("/api-keys/{key}")
def delete_api_key(key: str, db: Session = Depends(get_db)):
    db.query(models.ApiKey).filter(models.ApiKey.key == key).delete()
    db.commit()
    return {"message": "API key deleted"}


@app.post("/logs")
async def receive_log(
    log: LogRequest,
    db: Session = Depends(get_db),
    x_api_key: str = Header(None)
):
    
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")

    valid_key = db.query(models.ApiKey).filter(
        models.ApiKey.key == x_api_key
    ).first()

    if not valid_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    key_name = valid_key.name

    log_dict = log.dict()
    
    if not log_dict["timestamp"]:
        log_dict["timestamp"] = datetime.utcnow().isoformat()


    geo = get_geo(log_dict["ip"])
    log_dict["country"] = geo["country"]

    rule_result = detect_anomaly(log_dict)
    ml_result = detect_ml_anomaly(log_dict)

    rule_score = rule_result["risk_score"]
    ml_score = ml_result["ml_score"]

    final_risk_score = min(100, int((rule_score * 0.6) + (ml_score * 0.4)))

    reasons = rule_result["reasons"].copy()

    if ml_result["ml_anomaly"]:
        reasons.append(ml_result["ml_reason"])

    is_anomaly = final_risk_score >= 50 or ml_result["ml_anomaly"]

    db_log = models.Log(
        user=log_dict["user"],
        ip=log_dict["ip"],
        country=geo["country"],
        city=geo["city"],
        latitude=geo["latitude"],
        longitude=geo["longitude"],
        status=log_dict["status"],
        endpoint=log_dict["endpoint"],
        user_agent=log_dict["user_agent"],
        timestamp=log_dict["timestamp"],
        is_anomaly=is_anomaly,
        rule_score=rule_score,
        ml_score=ml_score,
        risk_score=final_risk_score,
        ml_anomaly=ml_result["ml_anomaly"],
        reasons=", ".join(reasons),
        api_key_name=key_name
    )

    db.add(db_log)
    db.commit()
    db.refresh(db_log)

    if final_risk_score >= 75:
        log_dict["risk_score"] = final_risk_score
        log_dict["reasons"] = reasons
        asyncio.create_task(send_email_alert(log_dict))

    return {
        "message": "log received",
        "is_anomaly": is_anomaly,
        "rule_score": rule_score,
        "ml_score": ml_score,
        "final_risk_score": final_risk_score,
        "reasons": reasons,
        "ml_anomaly": ml_result["ml_anomaly"],
        "city": geo["city"],
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
    }


@app.get("/logs")
def get_logs(
    db: Session = Depends(get_db),
    key_name: str = Depends(get_api_key_owner)
):
    return db.query(models.Log).filter(
        models.Log.api_key_name == key_name
    ).order_by(models.Log.id.desc()).all()


@app.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    key_name: str = Depends(get_api_key_owner)
):
    return db.query(models.Log).filter(
        models.Log.api_key_name == key_name,
        models.Log.is_anomaly == True
    ).order_by(models.Log.id.desc()).all()


@app.delete("/logs")
def clear_logs(
    db: Session = Depends(get_db),
    key_name: str = Depends(get_api_key_owner)
):
    db.query(models.Log).filter(
        models.Log.api_key_name == key_name
    ).delete()

    db.commit()

    return {"message": "your logs and alerts cleared"}

@app.get("/my-ip")
async def get_my_ip(request: Request):
    ip = request.headers.get("x-forwarded-for", request.client.host)
    return {"ip": ip}
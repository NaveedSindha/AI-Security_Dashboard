from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.detector import detect_anomaly
from ml.ml_detector import detect_ml_anomaly
from backend.database import engine, get_db, Base
from backend import models
from backend.alerting import send_email_alert
from backend.geoip import get_geo
import asyncio

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Security Monitoring Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogRequest(BaseModel):
    user: str
    ip: str
    country: str
    status: str
    endpoint: str
    user_agent: str
    timestamp: str

@app.get("/")
def home():
    return {
        "message": "AI Security Monitoring Backend Running with ML 🚀",
        "routes": ["/logs", "/alerts", "/docs"]
    }

@app.post("/logs")
async def receive_log(log: LogRequest, db: Session = Depends(get_db)):
    log_dict = log.dict()

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
        reasons=", ".join(reasons)
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
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.Log).order_by(models.Log.id.desc()).all()

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(models.Log).filter(models.Log.is_anomaly == True).order_by(models.Log.id.desc()).all()

@app.delete("/logs")
def clear_logs(db: Session = Depends(get_db)):
    db.query(models.Log).delete()
    db.commit()
    return {"message": "all logs and alerts cleared"}
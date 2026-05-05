from sqlalchemy import Column, Integer, String, Boolean, Float
from backend.database import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String)
    ip = Column(String)
    country = Column(String)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String)
    endpoint = Column(String)
    user_agent = Column(String)
    timestamp = Column(String)
    is_anomaly = Column(Boolean)
    rule_score = Column(Integer)
    ml_score = Column(Integer)
    risk_score = Column(Integer)
    ml_anomaly = Column(Boolean)
    reasons = Column(String)
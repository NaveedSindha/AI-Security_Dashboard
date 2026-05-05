import aiosmtplib
import httpx
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
ALERT_TO_EMAIL = os.getenv("ALERT_TO_EMAIL")

async def send_email_alert(log: dict):
    try:
        message = EmailMessage()
        message["From"] = SMTP_USER
        message["To"] = ALERT_TO_EMAIL
        message["Subject"] = f"🚨 High Risk Alert — Score {log['risk_score']} from {log['country']}"
        message.set_content(f"""
High Risk Security Event Detected

User:       {log['user']}
IP:         {log['ip']}
Country:    {log['country']}
Endpoint:   {log['endpoint']}
Status:     {log['status']}
User Agent: {log['user_agent']}
Timestamp:  {log['timestamp']}

Risk Score: {log['risk_score']} / 100
Reasons:    {', '.join(log['reasons'])}
        """)

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        print(f"✅ Email alert sent for risk score {log['risk_score']}")
    except Exception as e:
        print(f"❌ Email alert failed: {e}")
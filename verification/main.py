from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from db import get_cursor, conn
from passlib.hash import bcrypt
from datetime import datetime, timedelta
import random
import aiosmtplib
from email.message import EmailMessage
import os

# ------------------------------
# Настройки
# ------------------------------
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
CODE_TTL_MINUTES = int(os.getenv("CODE_TTL_MINUTES", 5))
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", 5))

# ------------------------------
# FastAPI и модели
# ------------------------------
app = FastAPI()

class SendCodeRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

# ------------------------------
# Генерация и отправка кода
# ------------------------------
def generate_code():
    return f"{random.randint(100000, 999999)}"

async def send_email(to_email: str, code: str):
    message = EmailMessage()
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = "Ваш код подтверждения"
    message.set_content(f"Ваш код: {code}\nДействует {CODE_TTL_MINUTES} минут.")

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_USER,
        password=EMAIL_PASS,
    )

# ------------------------------
# /send-code
# ------------------------------
@app.post("/send-code")
async def send_code(req: SendCodeRequest):
    code = generate_code()
    hashed = bcrypt.hash(code)
    expire_at = datetime.utcnow() + timedelta(minutes=CODE_TTL_MINUTES)

    cur = get_cursor()
    cur.execute("SELECT email FROM email_codes WHERE email=%s", (req.email,))
    if cur.fetchone():
        cur.execute("""
            UPDATE email_codes
            SET code_hash=%s, expire_at=%s, attempts=0, last_attempt_at=NULL
            WHERE email=%s
        """, (hashed, expire_at, req.email))
    else:
        cur.execute("""
            INSERT INTO email_codes (email, code_hash, expire_at, attempts, created_at)
            VALUES (%s,%s,%s,0,NOW())
        """, (req.email, hashed, expire_at))
    conn.commit()
    cur.close()

    await send_email(req.email, code)
    return {"message": "Код отправлен"}

# ------------------------------
# /verify-code
# ------------------------------
@app.post("/verify-code")
def verify_code(req: VerifyCodeRequest):
    cur = get_cursor()
    cur.execute("""
        SELECT code_hash, expire_at, attempts FROM email_codes WHERE email=%s
    """, (req.email,))
    row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Email не найден")

    code_hash, expire_at, attempts = row
    now = datetime.utcnow()

    if attempts >= MAX_ATTEMPTS:
        raise HTTPException(status_code=403, detail="Превышено число попыток")
    if now > expire_at:
        raise HTTPException(status_code=400, detail="Код устарел")
    if not bcrypt.verify(req.code, code_hash):
        cur.execute("""
            UPDATE email_codes SET attempts=attempts+1, last_attempt_at=NOW() WHERE email=%s
        """, (req.email,))
        conn.commit()
        cur.close()
        raise HTTPException(status_code=400, detail="Неверный код")

    # Успешная проверка
    cur.execute("DELETE FROM email_codes WHERE email=%s", (req.email,))
    conn.commit()
    cur.close()
    return {"message": "Почта подтверждена"}

# ------------------------------
# Корень
# ------------------------------
@app.get("/")
def root():
    return {"status": "API работает"}

from flask import Flask, render_template, request
import pyotp
import qrcode
from io import BytesIO
import base64

app = Flask(__name__)

# Для примера хранение секретов в памяти
user_secrets = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register", methods=["POST"])
def register():
    email = request.form["email"]
    secret = pyotp.random_base32()
    user_secrets[email] = secret

    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=email, issuer_name="MyApp")

    qr = qrcode.QRCode()
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode()

    return render_template("qr.html", qr_code=qr_base64, secret=secret, email=email)

@app.route("/verify", methods=["POST"])
def verify():
    email = request.form["email"]
    otp = request.form["otp"]

    secret = user_secrets.get(email)
    if not secret:
        return render_template("fail.html")
    
    totp = pyotp.TOTP(secret)
    if totp.verify(otp):
        return render_template("success.html", email=email)
    else:
        return render_template("fail.html")

if __name__ == "__main__":
    app.run(debug=True)

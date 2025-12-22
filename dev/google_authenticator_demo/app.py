from flask import Flask, render_template, request, redirect, url_for, session
import requests

app = Flask(__name__)
app.secret_key = "YOUR_SECRET_KEY"  # для сессий

CLIENT_ID = "660870444962-d60ace1uae0u0g2t26e8qtq8240qu1qd.apps.googleusercontent.com"

@app.route("/")
def index():
    return render_template("index.html", client_id=CLIENT_ID)

@app.route("/verify-token", methods=["POST"])
def verify_token():
    token = request.json.get("credential")
    if not token:
        return {"error": "No token provided"}, 400

    # Проверка токена у Google
    r = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
    user_info = r.json()

    if user_info.get("aud") != CLIENT_ID:
        return {"error": "Invalid token"}, 400

    # Сохраняем данные в сессии
    session['user'] = {
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture")
    }

    return session['user']

@app.route("/profile")
def profile():
    user = session.get("user")
    if not user:
        return redirect(url_for("index"))
    return render_template("profile.html", user=user)

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)

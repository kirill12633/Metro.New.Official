from flask import Flask, request, jsonify, render_template_string
import requests

app = Flask(__name__)
CLIENT_ID = "660870444962-d60ace1uae0u0g2t26e8qtq8240qu1qd.apps.googleusercontent.com"

HTML_PAGE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Google OAuth Demo</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
    <h2>Войдите через Google</h2>
    <div class="g_id_signin"></div>
    <div id="user-info"></div>

    <script>
    function handleCredentialResponse(response) {
        fetch("/verify-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential })
        })
        .then(res => res.json())
        .then(data => {
            if(data.error){
                document.getElementById("user-info").innerText = "Ошибка: " + data.error;
            } else {
                document.getElementById("user-info").innerHTML =
                    "<p>Имя: " + data.name + "</p>" +
                    "<p>Email: " + data.email + "</p>" +
                    "<img src='" + data.picture + "' alt='User Picture'>";
            }
        });
    }

    window.onload = function() {
        google.accounts.id.initialize({
            client_id: "{{ client_id }}",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.querySelector(".g_id_signin"),
            { theme: "outline", size: "large" }
        );
    }
    </script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML_PAGE, client_id=CLIENT_ID)

@app.route("/verify-token", methods=["POST"])
def verify_token():
    token = request.json.get("credential")
    if not token:
        return jsonify({"error": "No token provided"}), 400
    r = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
    user_info = r.json()
    if user_info.get("aud") != CLIENT_ID:
        return jsonify({"error": "Invalid token"}), 400
    return jsonify({
        "email": user_info.get("email"),
        "name": user_info.get("name"),
        "picture": user_info.get("picture")
    })

if __name__ == "__main__":
    app.run(debug=True)

const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const CLIENT_ID = "660870444962-d60ace1uae0u0g2t26e8qtq8240qu1qd.apps.googleusercontent.com";

app.get("/", (req, res) => {
    res.send(`
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
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({credential: response.credential})
    })
    .then(res => res.json())
    .then(data => {
        if(data.error){
            document.getElementById("user-info").innerText = "Ошибка: " + data.error;
        } else {
            document.getElementById("user-info").innerHTML =
                "<p>Имя: "+data.name+"</p>" +
                "<p>Email: "+data.email+"</p>" +
                "<img src='"+data.picture+"'>";
        }
    });
}

window.onload = function() {
    google.accounts.id.initialize({client_id: "${CLIENT_ID}", callback: handleCredentialResponse});
    google.accounts.id.renderButton(document.querySelector(".g_id_signin"), {theme:"outline", size:"large"});
}
</script>
</body>
</html>
    `);
});

app.post("/verify-token", async (req, res) => {
    const token = req.body.credential;
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const user_info = await r.json();
    if(user_info.aud !== CLIENT_ID) return res.json({error: "Invalid token"});
    res.json({email: user_info.email, name: user_info.name, picture: user_info.picture});
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));

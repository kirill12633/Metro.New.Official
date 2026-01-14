const API_URL = "https://email-api.onrender.com"; // замени на свой Render URL

async function sendCode() {
  const email = document.getElementById("email").value;
  const res = await fetch(`${API_URL}/send-code`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email})
  });
  const data = await res.json();
  document.getElementById("result").innerText = JSON.stringify(data, null, 2);
}

async function verifyCode() {
  const email = document.getElementById("email").value;
  const code = document.getElementById("code").value;
  const res = await fetch(`${API_URL}/verify-code`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({email, code})
  });
  const data = await res.json();
  document.getElementById("result").innerText = JSON.stringify(data, null, 2);
}

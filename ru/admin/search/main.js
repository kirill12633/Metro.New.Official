import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Твой Web SDK
const firebaseConfig = {
  apiKey: "AIzaSyDNAyhui3Lc_IX0wuot7_Z6Vdf9Bw5A9mE",
  authDomain: "metro-new-85226.firebaseapp.com",
  databaseURL: "https://metro-new-85226-default-rtdb.firebaseio.com",
  projectId: "metro-new-85226",
  storageBucket: "metro-new-85226.firebasestorage.app",
  messagingSenderId: "905640751733",
  appId: "1:905640751733:web:f1ab3a1b119ca1e245fe3c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    localStorage.setItem("idToken", idToken);
    alert("Успешно вошли!");
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("searchDiv").style.display = "block";
  } catch (err) {
    alert(err.message);
  }
}

window.searchUser = async function () {
  const email = document.getElementById("searchInput").value;
  const idToken = localStorage.getItem("idToken");
  
  const res = await fetch(`/api/search?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: idToken }
  });
  
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

async function searchUser() {
  const email = document.getElementById("searchInput").value;
  const res = await fetch(`/api/search?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  document.getElementById("result").textContent = JSON.stringify(data, null, 2);
}

window.searchUser = async function () {
  const email = document.getElementById("searchInput").value;

  try {
    const res = await fetch(`/api/search?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    document.getElementById("result").textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById("result").textContent = err.message;
  }
}

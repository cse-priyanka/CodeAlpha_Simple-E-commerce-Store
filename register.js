const baseUrl = "http://127.0.0.1:4000";

function registerUser() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  if (!username || !password) {
    return alert("Username and password cannot be empty!");
  }

  fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.message === "Registration successful") {
      window.location.href = "login.html"; // redirect to login page
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error connecting to server!");
  });
}

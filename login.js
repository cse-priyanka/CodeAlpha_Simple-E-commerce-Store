const baseUrl = "http://127.0.0.1:4000";

function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    return alert("Username and password cannot be empty!");
  }

  fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.message === "Login successful") {
      localStorage.setItem("currentUser", data.username); // store logged-in user
      window.location.href = "products.html";            // go to products page
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error connecting to server!");
  });
}

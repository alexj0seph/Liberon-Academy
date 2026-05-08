const API_BASE = "http://localhost:5000/api";
const loginForm = document.getElementById("adminLoginForm");
const messageEl = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      messageEl.textContent = data.message || "Login failed.";
      return;
    }

    localStorage.setItem("adminToken", data.token);
    window.location.href = "/admin/dashboard";
  } catch (error) {
    messageEl.textContent = "Cannot connect to server. Start backend first.";
  }
});

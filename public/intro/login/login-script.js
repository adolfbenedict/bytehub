document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginButton = document.getElementById("loginButton");
    const originalButtonText = loginButton.innerHTML;
    const originalButtonOpacity = loginButton.style.opacity;

    loginButton.innerHTML = "Logging in...";
    loginButton.disabled = true;
    loginButton.style.opacity = "0.7";

    const usernameInput = document.getElementById("us");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value;
    const password = passwordInput.value;

    const BACKEND_URL = "https://bytehubserver.onrender.com";

    function showToast(message, type) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.className = "toast show";
      if (type) {
        toast.classList.add(type);
      }

      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          toast.className = "toast";
        }, 500);
      }, 3000);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", username);
        if (data.email) {
          localStorage.setItem("email", data.email);
        }
        console.log("Login successful. Redirecting...");
        window.location.href = "../dashboard/dashboard";
      } else {
        console.error("Login failed:", data.error || "Unknown error");
        showToast(data.error || "Login failed. Please try again.", "error");
        passwordInput.value = "";
        loginButton.innerHTML = originalButtonText;
        loginButton.disabled = false;
        loginButton.style.opacity = originalButtonOpacity;
      }
    } catch (error) {
      console.error("Error during login:", error);
      showToast(
        "An error occurred. Please check your network connection.",
        "error"
      );
      passwordInput.value = "";
      loginButton.innerHTML = originalButtonText;
      loginButton.disabled = false;
      loginButton.style.opacity = originalButtonOpacity;
    }

    const footerParagraph = document.querySelector("footer p");
    if (footerParagraph) {
      const currentYear = new Date().getFullYear();
      footerParagraph.textContent = footerParagraph.textContent.replace(
        /20\d{2}/,
        currentYear
      );
    }
  });

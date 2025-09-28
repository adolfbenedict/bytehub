document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginButton = document.getElementById("loginButton");
    const originalButtonText = loginButton.innerHTML;
    const originalButtonOpacity = loginButton.style.opacity;

    loginButton.innerHTML = "Logging in";
    loginButton.disabled = true;
    loginButton.style.opacity = "0.7";

    const identifierInput = document.getElementById("identifier");
    const passwordInput = document.getElementById("password");

    const identifier = identifierInput.value;
    const password = passwordInput.value;

    const BACKEND_URL = "https://bytehubserver.onrender.com";

    function showToast(message, type) {
      const toast = document.getElementById("toast");
      if (!toast) return; 
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
        credentials: "include", 
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Login successful!", "success");
        window.location.href = "../dashboard/dashboard";
      } else {
        const errorMessage = data.error || data.message || "Login failed. Please try again.";
        console.error("Login failed:", errorMessage);
        showToast(errorMessage, "error");
        
        passwordInput.value = "";
      }
    } catch (error) {
      console.error("Error during login:", error);
      showToast(
        "A network error occurred. Please check your connection.",
        "error"
      );
      passwordInput.value = "";
    } finally {
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
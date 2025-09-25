document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const signupButton = document.getElementById("signupButton");
  const originalButtonText = signupButton.innerHTML;
  const originalButtonOpacity = signupButton.style.opacity;

  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const toast = document.getElementById("toast");

  const BACKEND_URL = "https://bytehubserver.onrender.com";

  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = "toast show";
    toast.classList.add(type);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.className = "toast";
      }, 500);
    }, 5000);
  }

  function removeAllSpaces(str) {
    return str.replace(/\s/g, "");
  }

  function resetErrorBorders() {
    usernameInput.style.borderColor = "";
    emailInput.style.borderColor = "";
    passwordInput.style.borderColor = "";
    confirmPasswordInput.style.borderColor = "";
  }

  function validateUsername() {
    const username = removeAllSpaces(usernameInput.value);
    usernameInput.value = username;
    if (!username || username.length < 4) {
      return false;
    }
    return true;
  }

  function validateEmail() {
    const email = removeAllSpaces(emailInput.value);
    emailInput.value = email;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }
    return true;
  }

  function validatePassword() {
    const password = removeAllSpaces(passwordInput.value);
    passwordInput.value = password;
    if (!password || password.length < 6) {
      return false;
    }
    return true;
  }

  function validateConfirmPassword() {
    const confirmPassword = removeAllSpaces(confirmPasswordInput.value);
    confirmPasswordInput.value = confirmPassword;
    const password = removeAllSpaces(passwordInput.value);
    if (!confirmPassword || confirmPassword !== password) {
      passwordInput.style.borderColor = "var(--error-color)";
      confirmPasswordInput.style.borderColor = "var(--error-color)";
      return false;
    } else {
      passwordInput.style.borderColor = "";
      confirmPasswordInput.style.borderColor = "";
    }
    return true;
  }

  usernameInput.addEventListener("blur", validateUsername);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);
  confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    resetErrorBorders();

    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isUsernameValid) {
      showToast("Username must be at least 4 characters.", "error");
      return;
    }
    if (!isEmailValid) {
      showToast("Invalid email format.", "error");
      return;
    }
    if (!isPasswordValid) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (!isConfirmPasswordValid) {
      showToast("Passwords do not match.", "error");
      return;
    }

    signupButton.innerHTML = "Enrolling...";
    signupButton.disabled = true;
    signupButton.style.opacity = "0.7";

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const data = { username, email, password };

    try {
      const response = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (response.ok) {
        showToast(responseData.message);
        localStorage.setItem("userEmail", email);
        window.location.href = "../verification/verification";
      } else {
        showToast(responseData.error, "error");
        passwordInput.value = "";
        confirmPasswordInput.value = "";
        signupButton.innerHTML = originalButtonText;
        signupButton.disabled = false;
        signupButton.style.opacity = originalButtonOpacity;
      }
    } catch (error) {
      showToast(
        "An error occurred during signup. Please check your network connection.",
        "error"
      );
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      signupButton.innerHTML = originalButtonText;
      signupButton.disabled = false;
      signupButton.style.opacity = originalButtonOpacity;
    }
  });

  const togglePassword = document.getElementById("togglePassword");
  const closedEyeIconSrc =
    "https://img.icons8.com/material-outlined/24/ffffff/visible--v1.png";
  const openedEyeIconSrc =
    "https://img.icons8.com/material-outlined/24/ffffff/invisible--v1.png";

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const primaryPasswordField = document.getElementById("password");
      const confirmPasswordField = document.getElementById("confirmPassword");
      const icon = togglePassword;

      if (primaryPasswordField.type === "password") {
        primaryPasswordField.type = "text";
        confirmPasswordField.type = "text";
        icon.src = openedEyeIconSrc;
        icon.alt = "Hide Password";
      } else {
        primaryPasswordField.type = "password";
        confirmPasswordField.type = "password";
        icon.src = closedEyeIconSrc;
        icon.alt = "Show Password";
      }
    });
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

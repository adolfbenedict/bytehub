document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toast = document.getElementById('toast');

    const BACKEND_URL = 'https://bytehubserver.onrender.com';

    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.className = 'toast show';
        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }
        setTimeout(() => {
            toast.className = 'toast';
        }, 5000);
    }

    function removeAllSpaces(str) {
        return str.replace(/\s/g, '');
    }

    function triggerShake(element) {
        element.classList.add('shake-error');
        element.addEventListener('animationend', () => {
            element.classList.remove('shake-error');
        }, { once: true });
    }

    function logError(message) {
        console.error('Signup Error:', message);
    }

    function validateUsername() {
        const username = removeAllSpaces(usernameInput.value);
        usernameInput.value = username; 
        if (!username || username.length < 4) {
            const msg = !username ? 'Username is required.' : 'Username must be at least 4 characters.';
            showToast(msg, true);
            triggerShake(usernameInput);
            return false;
        }
        return true;
    }

    function validateEmail() {
        const email = removeAllSpaces(emailInput.value);
        emailInput.value = email;
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!email || !emailRegex.test(email)) {
            const msg = !email ? 'Email is required.' : 'Invalid email format.';
            showToast(msg, true);
            triggerShake(emailInput);
            return false;
        }
        return true;
    }

    function validatePassword() {
        const password = removeAllSpaces(passwordInput.value);
        passwordInput.value = password;
        if (!password || password.length < 6) {
            const msg = !password ? 'Password is required.' : 'Password must be at least 6 characters.';
            showToast(msg, true);
            triggerShake(passwordInput);
            return false;
        }
        return true;
    }

    function validateConfirmPassword() {
        const confirmPassword = removeAllSpaces(confirmPasswordInput.value);
        confirmPasswordInput.value = confirmPassword;
        const password = removeAllSpaces(passwordInput.value);
        if (!confirmPassword || confirmPassword !== password) {
            const msg = !confirmPassword ? 'Confirm password is required.' : 'Passwords do not match.';
            showToast(msg, true);
            triggerShake(confirmPasswordInput);
            triggerShake(passwordInput);
            return false;
        }
        return true;
    }

    usernameInput.addEventListener('blur', validateUsername);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
             return;
        }

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        const data = { username, email, password };

        try {
            const response = await fetch(`${BACKEND_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            
            if (response.ok) {
                showToast(responseData.message);
                localStorage.setItem('userEmail', email);
                console.log('Stored in localStorage:', { email: email });
                
                window.location.href = '../verification/verification.html'; 
            } else {
                showToast(responseData.error, true);
                logError('Signup failed: ' + responseData.error);
                triggerShake(usernameInput);
                triggerShake(emailInput);
                triggerShake(passwordInput);
                triggerShake(confirmPasswordInput);
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error during signup:', error);
            showToast('An error occurred during signup. Please check your network connection.', true);
            triggerShake(usernameInput);
            triggerShake(emailInput);
            triggerShake(passwordInput);
            triggerShake(confirmPasswordInput);
            passwordInput.value = '';
            confirmPasswordInput.value = '';
        }
    });

    const togglePassword = document.getElementById('togglePassword');
    const closedEyeIconSrc = 'https://img.icons8.com/material-outlined/24/ffffff/visible--v1.png';
    const openedEyeIconSrc = 'https://img.icons8.com/material-outlined/24/ffffff/invisible--v1.png';

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const primaryPasswordField = document.getElementById('password');
            const confirmPasswordField = document.getElementById('confirmPassword');
            const icon = togglePassword;

            if (primaryPasswordField.type === 'password') {
                primaryPasswordField.type = 'text';
                confirmPasswordField.type = 'text';
                icon.src = openedEyeIconSrc;
                icon.alt = 'Hide Password';
            } else {
                primaryPasswordField.type = 'password';
                confirmPasswordField.type = 'password';
                icon.src = closedEyeIconSrc;
                icon.alt = 'Show Password';
            }
        });
    }

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});

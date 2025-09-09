document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const toast = document.getElementById('toast');

    // Hardcoded URL as requested
    const BACKEND_URL = 'https://bytehubserver.onrender.com';

    function showToast(message, type = 'error') {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
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

    function validateEmail() {
        const email = removeAllSpaces(emailInput.value);
        emailInput.value = email;

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!email) {
            showToast('Email is required', 'error');
            triggerShake(emailInput);
            return false;
        } else if (!emailRegex.test(email)) {
            showToast('Invalid email format', 'error');
            triggerShake(emailInput);
            return false;
        }
        return true;
    }

    emailInput.addEventListener('blur', validateEmail);

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateEmail()) {
            return;
        }

        const email = emailInput.value;

        try {
            const response = await fetch(`${BACKEND_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const responseData = await response.json();

            if (response.ok) {
                showToast(responseData.message || 'If a user with that email exists, a password reset link has been sent.', 'success');
                forgotPasswordForm.reset();
            } else {
                showToast(responseData.error || 'Password reset failed. Please try again.', 'error');
                triggerShake(emailInput);
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            showToast('Network error or server unreachable. Please try again.', 'error');
            triggerShake(emailInput);
        }
    });

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
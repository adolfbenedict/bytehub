document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const toast = document.getElementById('toast');
    const forgotPasswordButton = forgotPasswordForm.querySelector('button[type="submit"]');

    const BACKEND_URL = 'https://bytehubserver.onrender.com';

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast show';
        if (type) {
            toast.classList.add(type);
        }

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.className = 'toast';
            }, 500);
        }, 5000);
    }

    function removeAllSpaces(str) {
        return str.replace(/\s/g, '');
    }

    function validateEmail() {
        const email = removeAllSpaces(emailInput.value);
        emailInput.value = email;
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!email) {
            showToast('Email is required', 'error');
            return false;
        } else if (!emailRegex.test(email)) {
            showToast('Invalid email format', 'error');
            return false;
        }
        return true;
    }

    emailInput.addEventListener('blur', validateEmail);

    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const originalButtonText = forgotPasswordButton.innerHTML;
        const originalButtonOpacity = forgotPasswordButton.style.opacity;

        if (!validateEmail()) {
            return;
        }
        
        forgotPasswordButton.innerHTML = 'Sending';
        forgotPasswordButton.disabled = true;
        forgotPasswordButton.style.opacity = '0.7';

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
            }
        } catch (error) {
            showToast('Network error or server unreachable. Please try again.', 'error');
        } finally {
            forgotPasswordButton.innerHTML = originalButtonText;
            forgotPasswordButton.disabled = false;
            forgotPasswordButton.style.opacity = originalButtonOpacity;
        }
    });

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
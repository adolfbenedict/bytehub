document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const toastContainer = document.querySelector('.toast-container');
    const successToast = document.querySelector('.success-toast');
    const errorToast = document.querySelector('.error-toast');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const crossIcons = document.querySelectorAll('.cross-icon');

    const BACKEND_URL = 'https://bytehubserver.onrender.com';
    let timeoutId = null;

    function showToast(message, type = 'error') {
        clearTimeout(timeoutId);

        if (type === 'success') {
            successMessage.textContent = message;
            successToast.style.display = 'flex';
            errorToast.style.display = 'none';
        } else {
            errorMessage.textContent = message;
            errorToast.style.display = 'flex';
            successToast.style.display = 'none';
        }

        toastContainer.style.display = 'flex';
        setTimeout(() => {
            if (type === 'success') {
                successToast.classList.add('show');
            } else {
                errorToast.classList.add('show');
            }
        }, 10);

        timeoutId = setTimeout(hideToast, 5000);
    }

    function hideToast() {
        if (successToast.classList.contains('show')) {
            successToast.classList.remove('show');
        }
        if (errorToast.classList.contains('show')) {
            errorToast.classList.remove('show');
        }
        setTimeout(() => {
            toastContainer.style.display = 'none';
        }, 500);
    }

    crossIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            clearTimeout(timeoutId);
            hideToast();
        });
    });

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
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            showToast('Network error or server unreachable. Please try again.', 'error');
        }
    });

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});

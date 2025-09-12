document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const toast = document.getElementById('toast');
    

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

    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
            showToast('Invalid or missing token.', 'error');
            return;
        }

        const newPassword = removeAllSpaces(newPasswordInput.value);
        const confirmNewPassword = removeAllSpaces(confirmNewPasswordInput.value);

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters.', 'error');
            triggerShake(newPasswordInput);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast('Passwords do not match.', 'error');
            triggerShake(newPasswordInput);
            triggerShake(confirmNewPasswordInput);
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 3000);
            } else {
                showToast(data.error, 'error');
                triggerShake(newPasswordInput);
                triggerShake(confirmNewPasswordInput);
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred. Please try again later.', 'error');
        }
    });

    const toggleNewPasswordIcon = document.getElementById('toggleNewPasswordIcon');
    const toggleConfirmPasswordIcon = document.getElementById('toggleConfirmPasswordIcon');
    const closedEyeIconSrc = 'https://img.icons8.com/material-outlined/24/FFFFFF/visible--v1.png';
    const openedEyeIconSrc = 'https://img.icons8.com/material-outlined/24/FFFFFF/invisible.png';

    toggleNewPasswordIcon.addEventListener('click', () => {
        if (newPasswordInput.type === 'password') {
            newPasswordInput.type = 'text';
            confirmNewPasswordInput.type = 'text';
            toggleNewPasswordIcon.src = openedEyeIconSrc;
            toggleConfirmPasswordIcon.src = openedEyeIconSrc;
        } else {
            newPasswordInput.type = 'password';
            confirmNewPasswordInput.type = 'password';
            toggleNewPasswordIcon.src = closedEyeIconSrc;
            toggleConfirmPasswordIcon.src = closedEyeIconSrc;
        }
    });

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});

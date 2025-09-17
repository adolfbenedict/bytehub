document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('userEmail');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteConfirmationInput = document.getElementById('deleteAccountConfirmation');
    const requiredPhrase = "sudo delete bytehub account";

    const BACKEND_URL = 'https://bytehubserver.onrender.com';

    function loadUserEmail() {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            userEmailSpan.textContent = userEmail;
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.classList.remove('disabled-btn');
        } else {
            userEmailSpan.textContent = 'Not logged in';
            resetPasswordBtn.disabled = true;
            resetPasswordBtn.classList.add('disabled-btn');
        }
    }

    deleteAccountBtn.disabled = true;
    deleteAccountBtn.classList.add('disabled-btn');

    deleteConfirmationInput.addEventListener('input', () => {
        if (deleteConfirmationInput.value.toLowerCase() === requiredPhrase) {
            deleteAccountBtn.disabled = false;
            deleteAccountBtn.classList.remove('disabled-btn');
        } else {
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.classList.add('disabled-btn');
        }
    });

    resetPasswordBtn.addEventListener('click', () => {
        if (!resetPasswordBtn.disabled) {
            const originalButtonText = resetPasswordBtn.innerHTML;
            resetPasswordBtn.innerHTML = 'Sending...';
            resetPasswordBtn.disabled = true;
            resetPasswordBtn.style.opacity = '0.7';

            const userEmail = localStorage.getItem('email');
            
            fetch(`${BACKEND_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            }).finally(() => {
                resetPasswordBtn.innerHTML = originalButtonText;
                resetPasswordBtn.disabled = false;
                resetPasswordBtn.style.opacity = '';
                window.location.href = '../forgot-password/forgot-password.html';
            });
        }
    });

    deleteAccountBtn.addEventListener('click', async () => {
        if (!deleteAccountBtn.disabled) {
            const originalButtonText = deleteAccountBtn.innerHTML;
            deleteAccountBtn.innerHTML = 'Deleting...';
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.style.opacity = '0.7';

            const userEmail = localStorage.getItem('email');
            if (!userEmail) {
                localStorage.clear();
                window.location.replace('../index.html');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/delete-account`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail }),
                });

                if (response.ok) {
                    localStorage.clear();
                    window.location.replace('../index.html');
                } else {
                    deleteAccountBtn.innerHTML = originalButtonText;
                    deleteAccountBtn.disabled = false;
                    deleteAccountBtn.style.opacity = '';
                    window.location.replace('../index.html');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                deleteAccountBtn.innerHTML = originalButtonText;
                deleteAccountBtn.disabled = false;
                deleteAccountBtn.style.opacity = '';
                window.location.replace('../index.html');
            }
        }
    });

    loadUserEmail();

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
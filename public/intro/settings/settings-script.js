document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('userEmail');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteConfirmationInput = document.getElementById('deleteAccountConfirmation');
    const requiredPhrase = "sudo delete bytehub account";

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
            window.location.href = '../forgot-password/forgot-password.html';
        }
    });

    deleteAccountBtn.addEventListener('click', async () => {
        if (!deleteAccountBtn.disabled) {
            const userEmail = localStorage.getItem('email');
            if (!userEmail) {
                window.location.href = '../index.html';
                return;
            }

            try {
                const response = await fetch('https://bytehubserver.onrender.com/delete-account', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail }),
                });

                if (response.ok) {
                    localStorage.clear();
                    window.history.replaceState(null, null, '../index.html');
                    window.location.href = '../index.html';
                } else {
                    window.location.href = '../index.html';
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                window.location.href = '../index.html';
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

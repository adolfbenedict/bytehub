document.addEventListener('DOMContentLoaded', () => {
    const userEmailSpan = document.getElementById('userEmail');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteConfirmationInput = document.getElementById('deleteAccountConfirmation');
    const requiredPhrase = "delete my account";

    function loadUserEmail() {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            userEmailSpan.textContent = userEmail;
        } else {
            userEmailSpan.textContent = 'Not logged in';
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
        window.location.href = '../forgot-password/forgot-password.html';
    });

    deleteAccountBtn.addEventListener('click', () => {
        if (!deleteAccountBtn.disabled) {
            alert('Account deletion is not yet implemented.');
            deleteConfirmationInput.value = '';
            deleteAccountBtn.disabled = true;
            deleteAccountBtn.classList.add('disabled-btn');
        }
    });

    loadUserEmail();
});
document.addEventListener('DOMContentLoaded', () => {
    const codeInputs = document.querySelectorAll('.code-input');
    const verifyCodeForm = document.getElementById('verifyCodeForm');
    const verifyButton = verifyCodeForm.querySelector('button[type="submit"]');
    const toast = document.getElementById('toast');
    const resendLink = document.getElementById('resendCode');
    const email = localStorage.getItem('userEmail');

    const BACKEND_URL = 'https://bytehubserver.onrender.com';

    const showToast = (message, isError = false) => {
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
    };

    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const { value } = e.target;
            if (value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    verifyCodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalButtonText = verifyButton.innerHTML;
        const originalButtonOpacity = verifyButton.style.opacity;

        verifyButton.innerHTML = 'Verifying...';
        verifyButton.disabled = true;
        verifyButton.style.opacity = '0.7';

        const fullCode = Array.from(codeInputs).map(input => input.value).join('');

        if (fullCode.length !== 6 || !/^\d+$/.test(fullCode)) {
            showToast('Please enter a valid 6-digit code.', true);
            verifyButton.innerHTML = originalButtonText;
            verifyButton.disabled = false;
            verifyButton.style.opacity = originalButtonOpacity;
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: fullCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message);
                localStorage.removeItem('userEmail');
                window.location.href = '../login/login.html?verified=true';
            } else {
                showToast(data.error, true);
                verifyButton.innerHTML = originalButtonText;
                verifyButton.disabled = false;
                verifyButton.style.opacity = originalButtonOpacity;
            }
        } catch (error) {
                console.error('Error during verification:', error);
                showToast('An error occurred. Please try again later.', true);
                verifyButton.innerHTML = originalButtonText;
                verifyButton.disabled = false;
                verifyButton.style.opacity = originalButtonOpacity;
        }
    });

    resendLink.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!email) {
            showToast('An error occurred. Please go back to the signup page and try again.', true);
            return;
        }
        try {
            const response = await fetch(`${BACKEND_URL}/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });
            const data = await response.json();
            if (response.ok) {
                showToast(data.message);
            } else {
                showToast(data.error, true);
            }
        } catch (error) {
            console.error('Error resending code:', error);
            showToast('Failed to resend the code. Please try again later.', true);
        }
    });
});
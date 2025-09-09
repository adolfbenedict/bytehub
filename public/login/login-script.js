document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('us');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    function triggerShake(element) {
        element.classList.add('shake-error');
        element.addEventListener('animationend', () => {
            element.classList.remove('shake-error');
        }, { once: true });
    }

    try {
        const response = await fetch(`https://bytehub.onrender.com/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.redirect) {
            localStorage.setItem('username', username);
            if (data.email) {
                localStorage.setItem('email', data.email);
            }
            console.log('Login successful. Redirecting...');
            window.location.href = data.redirect;
        } else if (data.redirect) {
            alert(data.error);
            window.location.href = data.redirect;
        } else {
            console.error('Login failed:', data.error || 'Unknown error');
            alert(data.error || 'Login failed. Please try again.');
            triggerShake(usernameInput);
            triggerShake(passwordInput);
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please check your network connection.');
        triggerShake(usernameInput);
        triggerShake(passwordInput);
        passwordInput.value = '';
    }

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
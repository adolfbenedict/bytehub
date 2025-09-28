import { fetchWithAuth } from '../utils/api_wrapper.js'; 
const BACKEND_URL = "https://bytehubserver.onrender.com";

let accessToken = null;

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            if (!accessToken) {
                window.location.reload();
            }
        }
    });
    
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const helpForm = document.getElementById('helpForm');
    const emailInputHelp = document.querySelector('#helpForm input[type="email"]');
    const courseButtons = document.querySelectorAll('.enroll-button');
    const headerNavLinks = document.querySelectorAll('.header-nav-icons a');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    async function fetchAccessToken() {
        try {
            const response = await fetch(`${BACKEND_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to refresh access token.');
            }

            const data = await response.json();
            accessToken = data.accessToken;
            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    }

    async function fetchAndValidateSession() {
        const sessionValid = await fetchAccessToken();

        if (sessionValid) {
            try {
                const userDataResponse = await fetchWithAuth(`${BACKEND_URL}/protected-data`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                const userData = await userDataResponse.json();

                if (userDataResponse.ok) {
                    emailInputHelp.value = userData.user.email || '';
                    enableAllControls();
                } else {
                    console.error('Failed to fetch protected data:', userData.error);
                    disableAllControls();
                    window.location.href = '../login/login';
                }
            } catch (error) {
                console.error('Error fetching protected data:', error);
                disableAllControls();
                window.location.href = '../login/login';
            }
        } else {
            disableAllControls();
            window.location.href = '../login/login';
        }
    }

    function disableCourseButtons() {
        courseButtons.forEach(button => {
            button.disabled = true;
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });
    }

    function enableCourseButtons() {
        courseButtons.forEach(button => {
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });
    }

    function disableAllControls() {
        headerNavLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        });

        sidebarLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
        });

        disableCourseButtons();
        const helpElement = document.getElementById('help');
        if (helpElement) {
            helpElement.style.display = 'none';
        }
    }

    function enableAllControls() {
        headerNavLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });

        sidebarLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });

        enableCourseButtons();
        const helpElement = document.getElementById('help');
        if (helpElement) {
            helpElement.style.display = 'block';
        }
    }

    fetchAndValidateSession();

    document.querySelectorAll('.header-nav-icons a, .sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(event) {
            if (this.getAttribute('href').startsWith('#')) {
                event.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    if (helpForm) {
        helpForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInputHelp.value;
            const message = document.getElementById('textarea').value;

            if (!email || !message) {
                alert('Please fill out all fields.');
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, message }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    
                    document.getElementById('textarea').value = '';
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

    const handleResize = () => {
        if (window.innerWidth > 991) {
            sidebar.style.transform = 'translateX(0)';
            sidebar.style.display = 'block';
            mainContent.style.marginLeft = '200px';
        } else {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.display = 'none';
            mainContent.style.marginLeft = '0';
        }
        document.body.classList.remove('no-scroll');
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
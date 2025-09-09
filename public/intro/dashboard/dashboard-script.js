document.addEventListener('DOMContentLoaded', () => {
    const displayNameElement = document.getElementById('displayName');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const helpForm = document.getElementById('helpForm');
    const emailInputHelp = document.querySelector('#helpForm input[type="email"]');
    const courseButtons = document.querySelectorAll('.enroll-button');
    const headerNavLinks = document.querySelectorAll('.header-nav-icons a');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    async function fetchUserData() {
        try {
            const storedUsername = localStorage.getItem('username');
            const storedEmail = localStorage.getItem('email');

            if (storedUsername) {
                displayNameElement.textContent = `Hello, ${storedUsername}`;
                emailInputHelp.value = storedEmail || '';
                enableAllControls();
            } else {
                console.log('No username found. User might not be logged in.');
                displayNameElement.textContent = 'Welcome!';
                disableAllControls();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            displayNameElement.textContent = 'Welcome!';
            disableAllControls();
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
            if (!link.getAttribute('href').includes('#courses')) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            }
        });

        sidebarLinks.forEach(link => {
            if (!link.getAttribute('href').includes('#courses')) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            }
        });

        disableCourseButtons();
        document.getElementById('help').style.display = 'none';
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
        document.getElementById('help').style.display = 'block';
    }

    fetchUserData();

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
                    helpForm.reset();
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
            headerNavLinks.forEach(link => link.parentElement.style.display = 'none');
        } else {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.display = 'none';
            mainContent.style.marginLeft = '0';
            headerNavLinks.forEach(link => link.parentElement.style.display = 'flex');
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
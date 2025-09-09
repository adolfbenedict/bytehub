document.addEventListener('DOMContentLoaded', () => {
    const displayNameElement = document.getElementById('displayName');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const helpForm = document.getElementById('helpForm');
    const emailInputHelp = document.querySelector('#helpForm input[type="email"]');
    const courseButtons = document.querySelectorAll('.enroll-button');
    // Select all links in the header navigation for disabling/enabling
    const headerNavLinks = document.querySelectorAll('.header-nav-icons a');
    // Select all links in the sidebar for disabling/enabling
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
        // Disable all header nav links except #courses (if applicable)
        headerNavLinks.forEach(link => {
            if (!link.getAttribute('href').includes('#courses')) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
            }
        });

        // Disable all sidebar links except #courses (if applicable)
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
        // Enable all header nav links
        headerNavLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });

        // Enable all sidebar links
        sidebarLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
        });

        enableCourseButtons();
        document.getElementById('help').style.display = 'block';
    }

    fetchUserData();

    // Event listener for anchor links in header nav and sidebar to smooth scroll
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
        helpForm.addEventListener('submit', (event) => {
            console.log('Help form submitted.');
        });
    }

    // Adjust layout based on window resize
    const handleResize = () => {
        if (window.innerWidth > 991) { // Desktop view: Sidebar visible, header nav hidden
            sidebar.style.transform = 'translateX(0)'; // Sidebar always open
            sidebar.style.display = 'block'; // Ensure sidebar is block for transition
            mainContent.style.marginLeft = '200px'; // Push main content
            headerNavLinks.forEach(link => link.parentElement.style.display = 'none'); // Hide header nav icons
        } else { // Mobile/Tablet view: Sidebar hidden, header nav visible
            sidebar.style.transform = 'translateX(-100%)'; // Sidebar always hidden
            sidebar.style.display = 'none'; // Ensure sidebar is fully hidden
            mainContent.style.marginLeft = '0'; // Main content full width
            headerNavLinks.forEach(link => link.parentElement.style.display = 'flex'); // Show header nav icons
        }
        // Ensure no-scroll is off since there's no dynamic sidebar
        document.body.classList.remove('no-scroll');
    };

    window.addEventListener('resize', handleResize);

    // Initial call to handleResize on page load
    handleResize();

    // Auto update year in footer
    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const resetPasswordButton = document.getElementById('resetPasswordButton');
    const dashboardLink = document.getElementById('dashboard-link');

   
    const fixedProfilePicture = document.getElementById('fixedProfilePicture');

     fixedProfilePicture.src = 'https://images.pexels.com/photos/6424587/pexels-photo-6424587.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';


    emailInput.value = localStorage.getItem('email') || '';

    resetPasswordButton.addEventListener('click', () => {

        window.location.href = '/HTML/Byte Hub/public/reset-password/reset-password.html';
    });

    dashboardLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '/HTML/Byte Hub/public/dashboard/dashboard.html';
    });


    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.textContent = footerParagraph.textContent.replace(/20\d{2}/, currentYear);
    }
});
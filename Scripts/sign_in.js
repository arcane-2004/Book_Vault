const signInForm = document.getElementById('sign-in-form');
const signUpForm = document.getElementById('sign-up-form');
const signInBox = document.getElementById('sign-in-box');
const signUpBox = document.getElementById('sign-up-box');
const signupError = document.getElementById('signup-error');

// Function to toggle between Sign In and Sign Up forms
function toggleForms() {
    signInBox.classList.toggle('hidden');
    signUpBox.classList.toggle('hidden');
    signupError.style.display = 'none'; // Reset error message
}


signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('sign-in-email').value;
    const password = document.getElementById('sign-in-password').value;

    try {
        const response = await fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.success) {
            // Store user sign-in status in localStorage
            localStorage.setItem('user', JSON.stringify({ email, name: data.name })); 

            window.location.href = "../index.html"; 
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during sign in:', error);
    }
});

// Sign Up Form Submission
signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('sign-up-name').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (data.success) {
            alert('Registration successful! You can now Sign In.');
            toggleForms(); // Switch to Sign In form
        } else {
            signupError.style.display = 'block'; 
        }
    } catch (error) {
        console.error('Error during sign up:', error);
    }
});

// Nav bar toggle for mobile menu
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

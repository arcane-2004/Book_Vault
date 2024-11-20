function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "grid";
    evt.currentTarget.className += " active";
}
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

const email = JSON.parse(localStorage.getItem('user')).email;

if (email) {
    // Fetch user data from the server
    fetch('http://localhost:3000/user_data') // Use the correct server endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            // Find the user matching the email
            const matchingUser = data.find(item => item.email === email);

            if (matchingUser) {
                console.log('Matching User Data:', matchingUser);
                // Use the data (e.g., display it on the dashboard)
                document.querySelector('#name').innerHTML = '<i>Welcome, ' + matchingUser .name + ' ! <br><br>';
                document.querySelector('#email').innerHTML = matchingUser.email
                document.querySelector('#books').innerHTML = matchingUser.book
                document.querySelector('#userid').innerHTML = matchingUser.userid
                
           
            } else {
                console.warn('No user found for this email');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
} else {
    console.error('No email found in localStorage');
}

function signOut() {
    localStorage.removeItem('user'); // Remove user data from localStorage
    document.querySelector('#name').innerHTML = ""
    document.querySelector('#email').innerHTML = ""
    document.querySelector('#books').innerHTML = ""
}
document.querySelector(".nav-menu button").addEventListener("click", () => {
    signOut()
    window.location.href = "/Book_Vault/index.html";
});
    


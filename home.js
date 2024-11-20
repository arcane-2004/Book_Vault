let allBooks = []; // Store all books globally

// Function to fetch all books from the server
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        allBooks = await response.json(); // Store the fetched books
        displayBooks(allBooks); // Display all books initially
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

// Function to display the fetched books in a table
function displayBooks(books) {
    const tableBody = document.querySelector('#books-table tbody');
    tableBody.innerHTML = ''; // Clear previous entries

    books.forEach(book => {
        const bookElement = document.createElement('tr');
        bookElement.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.description}</td>
        `;
        tableBody.appendChild(bookElement);
    });
}

// Handle the search form submission and filter the books
async function handleSearch(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const query = document.getElementById('search-input').value.toLowerCase();

    // Filter books based on the search query
    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
    );

    displayBooks(filteredBooks); // Display filtered books
}

// Call fetchBooks on page load to populate the table
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Checking sign-in status...');
    checkSignInStatus(); // Check if the user is signed in
    fetchBooks(); // Fetch and display all books
});

// Function to check the sign-in status of the user
function checkSignInStatus() {
    const user = JSON.parse(localStorage.getItem('user'));

    const navMenu = document.getElementById('nav-menu');
    const signInButton = navMenu.querySelector('button');
    const signOutButton = navMenu.querySelector('.signed-in');

    if (user) {
        // User is signed in, show Sign Out 
        signInButton.textContent = 'Sign Out';
        signInButton.onclick = () => {
            signOut(); // Handle sign out
        };

        signOutButton.style.display = 'inline-block'; // Show sign-out button
    
    } else {
        // User is not signed in, show Sign In button
        signInButton.textContent = 'Sign In';
        signInButton.onclick = () => {
            window.location.href = '/Book_Vault/Pages/sign_in.html'; // Redirect to sign-in page
        };

        signOutButton.style.display = 'none'; // Hide sign-out button
    }
}

// Function to handle the sign-out action
function signOut() {
    localStorage.removeItem('user'); // Remove user data from localStorage
    // document.querySelector('#name').innerHTML = ""
    // document.querySelector('#email').innerHTML = ""
    // document.querySelector('#books').innerHTML = ""
    // checkSignInStatus(); // Update UI to show Sign In button
    window.location.href = "/Book_Vault/index.html";
}

// Nav bar toggle for mobile menu
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
}

let allBooks = []; // Store all books globally
let availableBooks = []; // Store available books titles globally

// Function to fetch all books from the server
async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:3000/api/books');
        allBooks = await response.json(); // Store the fetched books
        await fetchAvailability(); // Fetch availability and merge with books
        displaysearch(allBooks); // Display all books initially
    } catch (error) {
        console.error('Error fetching books:', error);
        alert('Failed to fetch books. Please try again later.');
    }
}

// Function to fetch available books data from available.json file
async function fetchAvailability() {
    try {
        const response = await fetch('http://localhost:3000/not_available'); // Path to available.json file
        const data = await response.json(); // Get the available books
        availableBooks = data.books.map(book => book.title); // Extract available book titles

        // Merge availability status into the books dataset
        allBooks = allBooks.map(book => ({
            ...book,
            availability: availableBooks.includes(book.title) ? 'No' : 'Yes' // Set availability status
        }));
    } catch (error) {
        console.error('Error fetching availability:', error);
        alert('Failed to load availability data.');
    }
}

// Function to display books in a card format
function displaysearch(books) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    resultsContainer.innerHTML = ''; // Clear previous results

    if (books.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results" style="text-align: center; padding: 20px;">
                <p style="color: #666; font-size: 1.1em;">No books found matching your search criteria.</p>
            </div>`;
        return;
    }

    books.forEach(book => { 
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.style.cssText = `
            border: 1px solid #ccc; padding: 15px; margin: 10px;
            width: 300px; height: auto; display: inline-block; text-align: left; font-size: 12px;
            border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);`;

        bookCard.innerHTML = `
            <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}" 
                style="width: 100%; height: 175px; object-fit: contain; margin-bottom: 10px; border-radius: 4px;">
            <h3 style="margin: 10px 0; color: #333;">${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Genre:</strong> ${book.genre}</p>
            <p><strong>Description:</strong> ${book.description}</p>
            <p style="color: ${book.availability === 'Yes' ? 'green' : 'red'};">
                <strong>Availability:</strong> ${book.availability}
            </p>`;

        resultsContainer.appendChild(bookCard);
    });
}


// Function to handle the search logic
function handleSearch(event) {
    event.preventDefault(); // Prevent form submission
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    console.log('Search query:', query);

    if (!query) {
        console.warn('Empty search query.');
        displaysearch(allBooks); // Show all books if no query
        return;
    }

    // Filter books based on the query
    const filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
    );

    console.log('Filtered books:', filteredBooks);
    displaysearch(filteredBooks); // Display search results
}

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
        signInButton.textContent = 'Sign In';
        signInButton.onclick = () => {
            window.location.href = './Pages/sign_in.html'; // Redirect to sign-in page
        };

        signOutButton.style.display = 'none';
    }
}

// Function to handle the sign-out action
function signOut() {
    localStorage.removeItem('user'); // Remove user data from localStorage
    window.location.href = "./index.html"; // Redirect to home page
}

// Nav bar toggle for mobile menu
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active');
    navMenu.setAttribute(
        'aria-expanded',
        navMenu.classList.contains('active').toString()
    );
}

// Initialize the app once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Initializing application...');
    checkSignInStatus();
    fetchBooks();

    // Attach event listener to the search form
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
        console.log('Search form listener attached.');
    } else {
        console.error('Search form not found in the DOM.');
    }
});

// Function to switch tabs
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none"; // Hide all tab contents
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", ""); // Remove active class from all tabs
    }

    document.getElementById(tabName).style.display = "block"; // Show the selected tab content
    evt.currentTarget.className += " active"; // Add active class to the clicked tab
}

// Function to toggle the navigation menu
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.classList.toggle('active'); // Toggle the visibility of the nav menu
}

// Fetch user data from the server and display it on the dashboard
const userData = JSON.parse(localStorage.getItem('user'));

if (userData && userData.email) {
    fetch('http://localhost:3000/user_data') // Use the correct server endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            console.log('User Data from Server:', data); // Debugging line

            // Find the user matching the email
            const matchingUser = data.find(item => item.email === userData.email);

            if (matchingUser) {
                console.log('Matching User Data:', matchingUser);
                // Display user details
                document.querySelector('#name').innerHTML = matchingUser.name;
                document.querySelector('#email').innerHTML = matchingUser.email;
                document.querySelector('#userid').innerHTML = matchingUser.userid;

                // Update issued books in the "Your Books" tab
                const userBooksHistory = document.querySelector('#curr-books') // Display issued books
                const userBooksList = document.querySelector('#history') // Display issued books

                userBooksHistory.innerHTML = '';
                matchingUser.book.forEach(bookTitle => {
                    const li = document.createElement('li');
                    li.textContent = bookTitle;
                    userBooksHistory.appendChild(li);
                });

                userBooksList.innerHTML = ''; // Clear previous books
                matchingUser.issued_books.forEach(bookTitle => {
                    const li = document.createElement('li');
                    li.textContent = bookTitle;
                    userBooksList.appendChild(li);
                });
                // Fetch recommended books based on issued books
                fetchRecommendedBooks(matchingUser.book); // Split the string into an array
            } else {
                console.warn('No user found for this email');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
} else {
    console.error('No user data found in localStorage');
}

// Function to fetch book data and find recommendations
async function fetchRecommendedBooks(userBooks) {
    try {
        const response = await fetch('../node/data.json'); // Adjust path as necessary
        if (!response.ok) {
            throw new Error('Failed to fetch book data');
        }
        const allBooks = await response.json();
        console.log('All Books Data:', allBooks); // Debugging line

        const recommendedBooks = findSimilarBooks(userBooks, allBooks);
        // displayRecommendedBooks(recommendedBooks);
        displaysearch(recommendedBooks);

    } catch (error) {
        console.error('Error fetching book data:', error);
    }
}

// Function to find similar books based on genre or author
function findSimilarBooks(userBooks, allBooks) {
    const userBookTitles = userBooks.map(book => book.toLowerCase());
    const userBookDetails = allBooks.filter(book =>
        userBookTitles.includes(book.title.toLowerCase())
    );

    // Get genres and authors of issued books
    const userGenres = new Set(userBookDetails.map(book => book.genre.toLowerCase()));
    const userAuthors = new Set(userBookDetails.map(book => book.author.toLowerCase()));

    // Recommend books with matching genres or authors that are not already borrowed
    const recommendedBooks = allBooks.filter(book =>
        !userBookTitles.includes(book.title.toLowerCase()) &&
        (userGenres.has(book.genre.toLowerCase()) || userAuthors.has(book.author.toLowerCase()))
    );

    return recommendedBooks.slice(0, 5);
}

// Function to display recommended books
function displayRecommendedBooks(recommendedBooks) {
    const recommendedBooksDiv = document.getElementById('recommended-books');
    if (recommendedBooks.length > 0) {
        recommendedBooksDiv.innerHTML = recommendedBooks.map(book =>
            `<div><strong>${book.title}</strong> by ${book.author} (${book.genre})</div>`
        ).join('');
    } else {
        recommendedBooksDiv.innerHTML = '<div>No recommendations available.</div>';
    }
}

//--------display book------------------------------------------------------------
function displaysearch(books) {
    const container = document.getElementById('recommended-books');
    if (!container) {
        console.error('Results container not found');
        return;
    }

    container.innerHTML = ''; // Clear previous results

    if (books.length === 0) {
        container.innerHTML = `
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
            width: 150px; display: inline-block; text-align: left;
            border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            font-size: 12px`;

        bookCard.innerHTML = `
            <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}" 
                style="width: 100%; height: auto; object-fit: cover; margin-bottom: 10px; border-radius: 4px;">
            <h3 style="margin: 10px 0; color: #333;">${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Genre:</strong> ${book.genre}</p>
            <p><strong>Description:</strong> ${book.description}</p>`;

        container.appendChild(bookCard);
    });
}

// Toggle user menu for mobile view
function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('active');
}

function signOut() {
    localStorage.removeItem('user'); // Remove user data from localStorage
    window.location.href = "../index.html";
}
document.querySelector(".nav-menu button").addEventListener("click", () => {
    signOut()
});

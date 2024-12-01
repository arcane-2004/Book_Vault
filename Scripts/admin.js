let users = []; // Store user data globally
let availableBooks = []; // Store available books globally
let notAvailableBooks = []; // Store unavailable books globally
let userChoices = null;

// Fetch user data and available/unavailable books from the server
async function fetchData() {
    try {
        // Fetch user data
        const userResponse = await fetch('http://localhost:3000/user_data');
        if (!userResponse.ok) throw new Error('Failed to load user data');
        users = await userResponse.json();
        console.log("Users data:", users);

        // Fetch available books
        const availableResponse = await fetch('http://localhost:3000/api/books');
        if (!availableResponse.ok) throw new Error('Failed to load available books');
        availableBooks = await availableResponse.json(); // data.json is an array of books
        console.log("Available books:", availableBooks);

        // Fetch unavailable books
        const notAvailableResponse = await fetch('http://localhost:3000/not_available');
        if (!notAvailableResponse.ok) throw new Error('Failed to load not available books');
        const notAvailableData = await notAvailableResponse.json();
        notAvailableBooks = notAvailableData.books; // Each book in notAvailableBooks has a title
        console.log("Not available books:", notAvailableBooks);

        // Populate UI elements
        populateUserDropdown();
        populateBooksDropdown();
        populateNotAvailableBooksTable();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please try again later.');
    }
}

// Populate the user dropdown with data
function populateUserDropdown() {
    const userSelect = document.getElementById('user-select');
    if (!userSelect) {
        console.error("User dropdown element not found.");
        return;
    }

    // Clear previous options and Choices.js instance if already initialized
    if (userChoices) {
        userChoices.destroy();
    }
    userSelect.innerHTML = '';

    // Store the original users list for resetting
    const originalUsers = [...users];

    // Add options for each user with both ID and name
    originalUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.userid;
        option.textContent = `${user.name} (ID: ${user.userid})`;
        option.setAttribute('data-name', user.name.toLowerCase());
        option.setAttribute('data-userid', user.userid.toLowerCase());
        userSelect.appendChild(option);
    });

    // Initialize Choices.js with modified configuration
    userChoices = new Choices(userSelect, {
        searchEnabled: true,
        itemSelectText: '',
        placeholderValue: 'Search by name or ID',
        searchPlaceholderValue: 'Type name or ID to search',
        removeItemButton: true,
        searchResultLimit: 10,
        position: 'bottom',
        resetScrollPosition: false,
        shouldSort: false,
        searchFields: ['label', 'value'], // Use built-in search fields
        choices: originalUsers.map(user => ({
            value: user.userid,
            label: `${user.name} (ID: ${user.userid})`
        }))
    });

    // Handle search input changes
    userChoices.input.element.addEventListener('input', function (event) {
        const searchTerm = event.target.value.toLowerCase().trim();

        // Clear existing choices
        userChoices.clearStore();

        // Filter and set new choices
        const filteredChoices = originalUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.userid.toLowerCase().includes(searchTerm)
        );

        // Set the filtered choices
        userChoices.setChoices(
            filteredChoices.map(user => ({
                value: user.userid,
                label: `${user.name} (ID: ${user.userid})`,
                selected: false
            })),
            'value',
            'label',
            true // Should be true to replace existing choices
        );
    });

    // Handle selection
    userChoices.passedElement.element.addEventListener('choice', function (event) {
        // Don't clear the search immediately to allow for the selection to complete
        setTimeout(() => {
            // Reset the choices to the original list
            userChoices.clearStore();
            userChoices.setChoices(
                originalUsers.map(user => ({
                    value: user.userid,
                    label: `${user.name} (ID: ${user.userid})`
                })),
                'value',
                'label',
                true
            );
            // Clear the search input
            userChoices.input.element.value = '';
        }, 100);
    });

    // Handle clearing the selection
    userChoices.passedElement.element.addEventListener('removeItem', function () {
        // Reset choices to original state
        userChoices.clearStore();
        userChoices.setChoices(
            originalUsers.map(user => ({
                value: user.userid,
                label: `${user.name} (ID: ${user.userid})`
            })),
            'value',
            'label',
            true
        );
    });
}
// Declare a global variable for the book dropdown element to initialize Choices.js
let bookChoices = null;

// Populate the available books dropdown with Choices.js to make it searchable
function populateBooksDropdown() {
    const bookSelectElement = document.getElementById('book-input');
    if (!bookSelectElement) {
        console.error("Book dropdown element not found.");
        return;
    }

    // Clear previous options and Choices.js instance if already initialized
    if (bookChoices) {
        bookChoices.destroy();
    }
    bookSelectElement.innerHTML = '';

    availableBooks.forEach(book => {
        const option = document.createElement('option');
        option.value = book.title;
        option.textContent = book.title;
        bookSelectElement.appendChild(option);
    });

    // Initialize Choices.js on the book dropdown
    bookChoices = new Choices(bookSelectElement, {
        searchEnabled: true,
        itemSelectText: '',
        placeholderValue: 'Search or select a book',
    });
}

// Populate the table with unavailable books
function populateNotAvailableBooksTable() {
    const booksTableBody = document.getElementById('books-table')?.querySelector('tbody');
    if (!booksTableBody) {
        console.error("Books table body element not found.");
        return;
    }

    booksTableBody.innerHTML = ''; // Clear previous rows

    notAvailableBooks.forEach(notAvailableBook => {
        // Get the book details (author and genre) from availableBooks
        const bookDetails = availableBooks.find(book => book.title === notAvailableBook.title);

        if (bookDetails) {
            // Find the user who has issued the book
            const user = users.find(u => u.issued_books.includes(notAvailableBook.title));
            const issuerName = user ? user.name : "Unknown";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bookDetails.title}</td>
                <td>${bookDetails.author}</td>
                <td>${bookDetails.genre}</td>
                <td>${issuerName}</td>
            `;
            booksTableBody.appendChild(row);
        }
    });
}

// Display user information when a user is selected
function displayUserInfo() {
    const userId = document.getElementById('user-select')?.value;
    const userInfoDiv = document.getElementById('user-info');
    const actionsDiv = document.getElementById('actions');
    const userNameSpan = document.getElementById('user-name');
    const userEmailSpan = document.getElementById('user-email');
    const userBooksHistory = document.getElementById('user-books-history');
    const userBooksList = document.getElementById('user-books-list');

    if (!userInfoDiv || !actionsDiv || !userNameSpan || !userEmailSpan || !userBooksList) {
        console.error("Required user info elements not found.");
        return;
    }

    if (userId) {
        const user = users.find(u => u.userid === userId);
        if (user) {
            userNameSpan.textContent = user.name;
            userEmailSpan.textContent = user.email;
            userBooksHistory.innerHTML = '';
            user.book.forEach(bookTitle => {
                const li = document.createElement('li');
                li.textContent = bookTitle;
                userBooksHistory.appendChild(li);
            });

            userBooksList.innerHTML = ''; // Clear previous books

            user.issued_books.forEach(bookTitle => {
                const li = document.createElement('li');
                li.textContent = bookTitle;
                userBooksList.appendChild(li);
            });

            userInfoDiv.style.display = 'block';
            actionsDiv.style.display = 'block';
        }
    } else {
        userInfoDiv.style.display = 'none';
        actionsDiv.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const userSelect = document.getElementById('user-select');
    if (userSelect) {
        userSelect.addEventListener('change', displayUserInfo);
    }
});

// Handle form submission for issuing or returning books
document.getElementById('admin-form')?.addEventListener('submit', async event => {
    event.preventDefault();

    const userId = document.getElementById('user-select')?.value;
    const action = document.getElementById('book-action')?.value;
    const bookTitle = document.getElementById('book-input')?.value.trim();

    if (!userId || !action || !bookTitle) {
        alert('Please fill out all fields.');
        return;
    }

    const user = users.find(u => u.userid === userId);
    if (!user) {
        alert('User not found.');
        return;
    }

    try {
        if (action === 'issue') {
            await issueBook(user, bookTitle);
        } else if (action === 'return') {
            await returnBook(user, bookTitle);
        }

    } catch (error) {
        console.error('Error handling book issue/return:', error);
        alert('An error occurred while processing the request.');
    }
});

// Issue a book to a user
// Issue a book to a user
async function issueBook(user, bookTitle) {
    if (user.issued_books.includes(bookTitle)) {
        alert('This book is already issued to the user.');
        return;
    }

    if (notAvailableBooks.some(book => book.title === bookTitle)) {
        alert('This book is currently not available.');
        return;
    }

    user.issued_books.push(bookTitle);  // Add the book to the user's issued_books
    notAvailableBooks.push({ title: bookTitle });  // Add the book to the notAvailableBooks array

    displayStatusMessage(`The book "${bookTitle}" was successfully issued to "${user.name}." `);

    // After updating, send the updated data to the server
    await saveDataToServer();
    populateBooksDropdown();  // Refresh dropdown after issuing
    populateNotAvailableBooksTable();  // Refresh unavailable books table
}

// Return a book from a user
async function returnBook(user, bookTitle) {
    const index = user.issued_books.indexOf(bookTitle);
    if (index === -1) {
        alert('This book was not issued to the user.');
        return;
    }

    user.issued_books.splice(index, 1);  // Remove the book from the user's issued_books
    user.book.push(bookTitle);
    const notAvailableIndex = notAvailableBooks.findIndex(book => book.title === bookTitle);
    if (notAvailableIndex !== -1) {
        notAvailableBooks.splice(notAvailableIndex, 1);  // Remove the book from notAvailableBooks
    }

    displayStatusMessage(`The book "${bookTitle}" was successfully returned by "${user.name}." `);

    // After updating, send the updated data to the server
    await saveDataToServer();
    populateBooksDropdown();  // Refresh dropdown after returning
    populateNotAvailableBooksTable();  // Refresh unavailable books table
}

// Send the updated data to the server
async function saveDataToServer() {
    try {
        const response = await fetch('http://localhost:3000/update-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                users: users,  // Send the updated users array
                notAvailableBooks: notAvailableBooks  // Send the updated notAvailableBooks array
            })
        });

        if (response.ok) {
            console.log('Data updated successfully');
        } else {
            console.error('Failed to update data');
        }
    } catch (error) {
        console.error('Error sending data to the server:', error);
    }
}

// Display status messages to the user
function displayStatusMessage(message) {
    const statusDiv = document.getElementById('status-message');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Load initial data and setup
fetchData();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Load book data from data.json
const dataPath = path.join(__dirname, 'data.json');
const usersDataPath = path.join(__dirname, 'user_data.json');
const not_availablePath = path.join(__dirname, 'not_available.json');

// Get books data
app.get('/api/books', (req, res) => {
    console.log('Received request for /api/books');
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).send('Error reading data');
        }
        res.json(JSON.parse(data));
    });
});

// Sign In Endpoint 
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    console.log('Sign in attempt with email:', email);  // For debugging

    // Read user data from user_data.json
    fs.readFile(usersDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user_data.json:', err);
            return res.status(500).send('Error reading user data');
        }

        // Parse user data
        const users = JSON.parse(data);
        const user = users.find(u => u.email === email && u.password === password);

        // Check if user was found with matching email and password
        if (user) {
            res.json({ success: true, message: 'Sign in successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    });
});


app.get('/user_data', (req, res) => {
    console.log('Request received for /user_data');
    fs.readFile(usersDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user_data.json:', err);
            return res.status(500).send('Error reading user data');
        }
        else {
            console.log('File Content:', data); // Log file content
        }
        try {
            const parsedData = JSON.parse(data);
            res.json(parsedData); // Send the JSON data as a response
        } catch (parseError) {
            console.error('Error parsing user_data.json:', parseError);
            res.status(500).send('Error parsing user data');
        }
    });
});

app.get('/not_available', (req, res) => {
    console.log('Request received for /not_available');
    fs.readFile(not_availablePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading not_available.json:', err);
            return res.status(500).send('Error reading not_available');
        }
        else {
            console.log('File Content:', data); // Log file content
        }
        try {
            const parsedData = JSON.parse(data);
            res.json(parsedData); // Send the JSON data as a response
        } catch (parseError) {
            console.error('Error parsing user_data.json:', parseError);
            res.status(500).send('Error parsing user data');
        }
    });
});
//-----updating the database---------------------

app.post('/update-data', (req, res) => {
    const { users, notAvailableBooks } = req.body;

    try {
        // Write new data to the users file
        fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));

        // Write new data to the not available books file
        fs.writeFileSync(not_availablePath, JSON.stringify({ books: notAvailableBooks }, null, 2));

        res.status(200).json({ message: 'Data updated successfully!' });
    } catch (error) {
        console.error('Error updating JSON files:', error);
        res.status(500).json({ message: 'Failed to update data.' });
    }
});

app.use(express.static(path.join(__dirname, 'node')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

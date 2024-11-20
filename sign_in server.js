const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // for comparing hashed passwords
const app = express();
const PORT = 3000;

app.use(express.json());

// Path to the JSON "database" file
const filePath = path.join(__dirname, 'name.json');

// Helper function to read data from JSON file
function readDatabase() {
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }
    return [];
}

// Sign In Endpoint
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Read the database (name.json)
    let data = readDatabase();

    // Find the user by email
    const user = data.find(user => user.email === email);

    // If user is found, verify the password
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ success: true, message: 'Sign in successful!' });
    } else {
        res.json({ success: false, message: 'Invalid email or password.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

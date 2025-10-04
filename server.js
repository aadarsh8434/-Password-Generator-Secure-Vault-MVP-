const express = require('express');
const fs = require('fs').promises; // Use promises version for async/await
const path = require('path');
const cors = require('cors'); // For development, if client is on a different origin

const app = express();
const PORT = process.env.PORT || 4000;
const VAULT_FILE = path.join(__dirname, 'vault.json');

// Middleware
app.use(cors()); // Enable CORS for all routes (for development)
app.use(express.json()); // To parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// Initialize vault file if it doesn't exist
async function initializeVault() {
    try {
        await fs.access(VAULT_FILE); // Check if file exists
    } catch (error) {
        if (error.code === 'ENOENT') { // File does not exist
            await fs.writeFile(VAULT_FILE, JSON.stringify({})); // Create an empty JSON object
            console.log('vault.json created.');
        } else {
            console.error('Error checking vault.json:', error);
        }
    }
}

// API Routes

// GET /api/vault - Load all passwords from the vault
app.get('/api/vault', async (req, res) => {
    try {
        const data = await fs.readFile(VAULT_FILE, 'utf8');
        const vault = JSON.parse(data);
        res.json(vault);
    } catch (error) {
        console.error('Error reading vault file:', error);
        // If file is empty or corrupted, send an empty object
        if (error.name === 'SyntaxError') {
             await fs.writeFile(VAULT_FILE, JSON.stringify({})); // Reset file
             return res.json({}); // Send empty vault
        }
        res.status(500).json({ error: 'Failed to load vault' });
    }
});

// POST /api/vault - Save a new password to the vault
app.post('/api/vault', async (req, res) => {
    const { category, password } = req.body;

    if (!category || !password) {
        return res.status(400).json({ error: 'Category and password are required.' });
    }

    try {
        const data = await fs.readFile(VAULT_FILE, 'utf8');
        const vault = JSON.parse(data);

        if (!vault[category]) {
            vault[category] = [];
        }
        if (!vault[category].includes(password)) { // Prevent duplicate passwords in the same category
            vault[category].push(password);
        } else {
            return res.status(409).json({ message: 'Password already exists in this category.' });
        }

        await fs.writeFile(VAULT_FILE, JSON.stringify(vault, null, 2));
        res.status(201).json({ message: 'Password saved successfully!' });
    } catch (error) {
        console.error('Error saving password:', error);
        res.status(500).json({ error: 'Failed to save password' });
    }
});

// DELETE /api/vault - Delete a password from the vault
app.delete('/api/vault', async (req, res) => {
    const { category, password } = req.body;

    if (!category || !password) {
        return res.status(400).json({ error: 'Category and password are required.' });
    }

    try {
        const data = await fs.readFile(VAULT_FILE, 'utf8');
        const vault = JSON.parse(data);

        if (vault[category]) {
            vault[category] = vault[category].filter(p => p !== password);

            // If category becomes empty, remove it
            if (vault[category].length === 0) {
                delete vault[category];
            }
        } else {
            return res.status(404).json({ message: 'Category or password not found.' });
        }

        await fs.writeFile(VAULT_FILE, JSON.stringify(vault, null, 2));
        res.json({ message: 'Password deleted successfully!' });
    } catch (error) {
        console.error('Error deleting password:', error);
        res.status(500).json({ error: 'Failed to delete password' });
    }
});

// Start the server
initializeVault().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Open http://localhost:${PORT} in your browser.`);
    });
});
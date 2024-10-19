const express = require('express');
const path = require('path');
const cors = require('cors');  // For handling CORS issues
const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for hardships and comments (replace with a database in production)
let hardships = [];

// Middleware
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files
app.use(express.json());  // Parse JSON bodies
app.use(cors());  // Enable Cross-Origin Resource Sharing

// Helper functions
const findHardshipById = (id) => hardships.find(h => h.id === parseInt(id));

// API Routes

// Submit a new hardship
app.post('/api/hardships', (req, res) => {
    const { text, category, userId } = req.body;

    // Simple validation
    if (!text || !category || !userId) {
        return res.status(400).json({ error: 'Text, category, and userId are required.' });
    }

    const newHardship = {
        id: Date.now(),
        userId,
        text,
        category,
        comments: [],
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        lastEdited: null
    };

    hardships.push(newHardship);
    return res.status(201).json(newHardship);
});

// Get all hardships
app.get('/api/hardships', (req, res) => {
    return res.json(hardships);
});

// Add a comment to a hardship
app.post('/api/hardships/:id/comments', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const hardship = findHardshipById(id);
    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    // Simple validation
    if (!text) {
        return res.status(400).json({ error: 'Comment text is required.' });
    }

    const newComment = {
        id: Date.now(),
        text,
        createdAt: new Date().toISOString()
    };

    hardship.comments.push(newComment);
    return res.status(201).json(newComment);
});

// Like or unlike a hardship
app.post('/api/hardships/:id/like', (req, res) => {
    const { id } = req.params;
    const hardship = findHardshipById(id);

    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    hardship.isLiked = !hardship.isLiked;  // Toggle the like status
    hardship.likes += hardship.isLiked ? 1 : -1;

    return res.status(200).json({ likes: hardship.likes, isLiked: hardship.isLiked });
});

// Edit a hardship (update text or category)
app.put('/api/hardships/:id', (req, res) => {
    const { id } = req.params;
    const { text, category } = req.body;

    const hardship = findHardshipById(id);
    if (!hardship) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    if (text) hardship.text = text;
    if (category) hardship.category = category;

    hardship.lastEdited = new Date().toISOString();
    return res.status(200).json(hardship);
});

// Delete a hardship
app.delete('/api/hardships/:id', (req, res) => {
    const { id } = req.params;
    const hardshipIndex = hardships.findIndex(h => h.id === parseInt(id));

    if (hardshipIndex === -1) {
        return res.status(404).json({ error: 'Hardship not found' });
    }

    hardships.splice(hardshipIndex, 1);
    return res.status(204).send();
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware (to catch any unexpected errors)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

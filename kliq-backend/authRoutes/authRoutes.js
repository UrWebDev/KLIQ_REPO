import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../authModels/authModels.js';  // Make sure the .js extension is included
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, recipientId, userId } = req.body;

        // Role-based validation
        if (role === 'recipient' && !recipientId) {
            return res.status(400).json({ error: "Recipient ID is required for recipients." });
        }
        if (role === 'user' && !userId) {
            return res.status(400).json({ error: "User ID is required for users." });
        }

        // Check for duplicate IDs
        if (recipientId) {
            const existingRecipient = await User.findOne({ recipientId });
            if (existingRecipient) {
                return res.status(400).json({ error: "Recipient ID is already in use." });
            }
        }
        if (userId) {
            const existingUser = await User.findOne({ userId });
            if (existingUser) {
                return res.status(400).json({ error: "User ID is already in use." });
            }
        }

        // Hash password and create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role, recipientId, userId });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            role: user.role,
            uniqueId: user.role === 'recipient' ? user.recipientId : user.userId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;

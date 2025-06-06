import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../authModels/authModels.js';  // Make sure the .js extension is included
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, recipientId, userId, age, name, bloodType } = req.body;

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: "Username is already in use." });
        }
        
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
        const newUser = new User({ username, password: hashedPassword, role, recipientId, userId, age, name, bloodType });
        await newUser.save();

        res.status(201).json({ message: "You have registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find the user in the database
        const user = await User.findOne({ username });

        if (!user) {
            console.error("User not found: ", username);
            return res.status(400).json({ error: 'User not found' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("Invalid password for user: ", username);
            return res.status(400).json({ error: 'Invalid Password' });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // Log the successful login
        console.log(`User logged in: ${username}, Role: ${user.role}`);

        // Send response with token, role info, and appropriate uniqueId (either recipientId or userId)
        const uniqueId = user.role === 'recipient' ? user.recipientId : user.userId;

        res.json({
            token,
            role: user.role,
            uniqueId: uniqueId,
        });
    } catch (error) {
        console.error("Error during login: ", error);
        res.status(500).json({ error: error.message });
    }
});

// Route to verify and get token data
router.get('/token-data', async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided or invalid format' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user in database to get additional info
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return token data and user info
        res.json({
            tokenData: decoded,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                recipientId: user.recipientId,
                userId: user.userId,
                age: user.age,
                name: user.name,
                bloodType: user.bloodType
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error("Error verifying token: ", error);
        res.status(500).json({ error: error.message });
    }
});



export default router;

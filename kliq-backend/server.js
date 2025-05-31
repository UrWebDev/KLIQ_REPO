import express from 'express';
import mongoose, { get } from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config()
const app = express();
// Middleware to parse application/x-www-form-urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));
app.use(bodyParser.json());
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.status(200).send("running on port 3000")
})

//for authentication role based
import authRoutes from './authRoutes/authRoutes.js';
app.use("/api/auth", authRoutes);


//emergency contacts API
import { getEmergencyHotlines, addEmergencyHotlines, updateEmergencyHotlines, deleteEmergencyHotlines } from './appRoutes/recipientsEmergencyHotlinesRoutes.js';

app.get('/recipients/getAllEmergencyContacts', getEmergencyHotlines);
app.post('/recipients/addEmergencyContact', addEmergencyHotlines);
app.put('/recipients/updateEmergencyContact/:id', updateEmergencyHotlines);
app.delete('/recipients/deleteEmergencyContact/:id', deleteEmergencyHotlines);

import { receiveRecipientSOSMessage, getFilteredSOSMessages, getUserFilteredSOSreports, deleteSOSMessageById} from './appRoutes/recipientSOSMessageRoutes.js'
// In-memory store for tokens (for demo; for production, use MongoDB)
import PushToken from './dbSchemas/pushTokenSchema.js';
import fetch from 'node-fetch';

app.post('/register-push-token', async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).send("Missing userId or token");

  try {
    await PushToken.findOneAndUpdate(
      { userId },
      { token },
      { upsert: true, new: true }
    );
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send("Failed to register token");
  }
});



app.post("/recipients/receive-sosMessage", receiveRecipientSOSMessage)
app.get("/recipients/get-filteredReceived-sosMessages/:recipientId", getFilteredSOSMessages)
app.get("/users/get-filteredSosMessages/:deviceId", getUserFilteredSOSreports)
app.delete("/delete/:id", deleteSOSMessageById);
import profileRoutes from "./appRoutes/profileRoutes.js"; // Import the profiles route
// Routes
app.use("/profiles", profileRoutes); // Use the /profiles route
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import axios from 'axios';

dotenv.config();
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors());
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

// Default route
app.get('/', (req, res) => {
  res.status(200).send("running on port 3000");
});

// Authentication Routes
import authRoutes from './authRoutes/authRoutes.js';
app.use("/api/auth", authRoutes);

// Emergency Contacts API
import { getEmergencyHotlines, addEmergencyHotlines, updateEmergencyHotlines, deleteEmergencyHotlines } from './appRoutes/recipientsEmergencyHotlinesRoutes.js';
app.get('/recipients/getAllEmergencyContacts', getEmergencyHotlines);
app.post('/recipients/addEmergencyContact', addEmergencyHotlines);
app.put('/recipients/updateEmergencyContact/:id', updateEmergencyHotlines);
app.delete('/recipients/deleteEmergencyContact/:id', deleteEmergencyHotlines);

// SOS Messages API
import { receiveRecipientSOSMessage, getFilteredSOSMessages, getUserFilteredSOSreports } from './appRoutes/recipientSOSMessageRoutes.js';
app.post("/recipients/receive-sosMessage", receiveRecipientSOSMessage);
app.get("/recipients/get-filteredReceived-sosMessages/:recipientId", getFilteredSOSMessages);
app.get("/users/get-filteredSosMessages/:deviceId", getUserFilteredSOSreports);

// ✅ Proxy endpoint for GET and POST
app.all("/proxy", async (req, res) => {
  const url = req.query.url; // Get the target URL from query params

  if (!url) {
      return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
      let response;

      if (req.method === "POST") {
          response = await axios.post(url, req.body, { headers: req.headers, timeout: 5000 });
      } else {
          response = await axios.get(url, { headers: req.headers, timeout: 5000 });
      }

      res.status(response.status).json(response.data);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`HTTP Proxy Server running on port ${PORT}`);
});
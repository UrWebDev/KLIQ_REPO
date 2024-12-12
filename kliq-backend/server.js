import express from 'express';
import mongoose, { get } from 'mongoose';
import cors from 'cors'
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config()
const app = express();
// Middleware to parse application/x-www-form-urlencoded data
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

import {receiveRecipientSOSMessage, getAllReceivedSOSMessage} from './appRoutes/recipientSOSMessageRoutes.js'
app.post("/recipients/receive-sosMessage", receiveRecipientSOSMessage)
app.get("/recipients/get-received-sosMessage", getAllReceivedSOSMessage)
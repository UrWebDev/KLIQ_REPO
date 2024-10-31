//original backend
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// require('dotenv').config();

// // Initialize Express app and Socket.io
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Parse incoming JSON requests
// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URL)
//   .then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB connection error:", err));

//   app.get('/', (req, res) => {
//     res.status(200).send('Running on port 3000');
// });
// // Define SMS schema
// const smsSchema = new mongoose.Schema({
//   receivedAt: { type: Date, default: Date.now },
//   phoneNumber: String,
//   message: String,
// });

// const SMS = mongoose.model('SMS', smsSchema); // Mongoose model

// // Webhook endpoint to receive SMS from multiple senders
// app.post('/webhook/sms', async (req, res) => {
//     const { From, Body } = req.body; // Assuming the SMS service sends 'From' and 'Body'
    
//     const sms = {
//       receivedAt: new Date(),
//       phoneNumber: From,
//       message: Body,
//     };
  
//     try {
//       await SMS.create(sms);
//       console.log("SMS saved to MongoDB:", sms); // Log the saved SMS
//       io.emit('newSMS', sms); // Emit new SMS event to frontend via Socket.io
//       res.status(200).send("SMS received");
//     } catch (err) {
//       console.error("Error saving SMS to MongoDB:", err);
//       res.status(500).send("Error saving SMS");
//     }
//   });
  

// // Route to get all received SMS
// app.get('/sms', async (req, res) => {
//     try {
//       const messages = await SMS.find().sort({ receivedAt: -1 });
//       console.log("Messages retrieved:", messages); // Log the messages
//       res.json(messages);
//     } catch (err) {
//       console.error("Error retrieving messages:", err);
//       res.status(500).send("Error retrieving messages");
//     }
//   });
  

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define SMS schema
const smsSchema = new mongoose.Schema({
  sentAt: { type: Date, default: Date.now },
  to: String,
  message: String,
});

const SMS = mongoose.model('SMS', smsSchema); // Mongoose model

// Endpoint to receive SMS data from ESP32
app.post('/webhook/sms', async (req, res) => {
  const { to, message } = req.body;

  const sms = {
    sentAt: new Date(),
    to: to,
    message: message,
  };

  try {
    await SMS.create(sms);
    console.log("SMS data saved to MongoDB:", sms);
    res.status(200).send("SMS data received");
  } catch (err) {
    console.error("Error saving SMS data to MongoDB:", err);
    res.status(500).send("Error saving SMS data");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.status(200).send("running on port 3k")
})
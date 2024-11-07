const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/kliq', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

const Contact = mongoose.model('Contact', contactSchema);

// Fetch all contacts
app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find();
  res.json({ contacts });
});

// Add a contact
app.post('/api/contacts', async (req, res) => {
  const { name, phone } = req.body;
  const newContact = new Contact({ name, phone });
  await newContact.save();
  res.json({ contact: newContact });
});

// Delete a contact
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  await Contact.findByIdAndDelete(id);
  res.json({ message: 'Contact deleted' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// push
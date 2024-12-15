import Hotlines from '../dbSchemas/recipientsEmergencyHotlinesSchema.js';  // Importing the Contact model

// Get all contacts
const getEmergencyHotlines = async (req, res) => {
  try {
    const { recipientId } = req.query;
    if (!recipientId) return res.status(400).json({ message: 'Recipient ID is required' });

    const hotlines = await Hotlines.find({ recipientId });
    res.json(hotlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add a new contact
const addEmergencyHotlines = async (req, res) => {
  try {
    const { name, phoneNumber, recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'Recipient ID is required' });

    const hotlines = new Hotlines({ name, phoneNumber, recipientId });
    await hotlines.save();
    res.status(201).json(hotlines);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Update a contact
const updateEmergencyHotlines = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const updateHotlines = await Hotlines.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber },
      { new: true }
    );
    if (!updateHotlines) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updateHotlines);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete a contact
const deleteEmergencyHotlines = async (req, res) => {
  try {
    const deleteHotlines = await Hotlines.findByIdAndDelete(req.params.id);
    if (!deleteHotlines) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { getEmergencyHotlines, addEmergencyHotlines, updateEmergencyHotlines, deleteEmergencyHotlines };  // Exporting controller functions

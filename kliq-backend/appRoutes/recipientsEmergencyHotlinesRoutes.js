import Hotlines from '../dbSchemas/recipientsEmergencyHotlinesSchema.js';  // Importing the Contact model

// Get all contacts
const getEmergencyHotlines = async (req, res) => {
  try {
    const hotlines = await Hotlines.find();
    res.json(hotlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new contact
const addEmergencyHotlines = async (req, res) => {
  try {
    const hotlines = new Hotlines(req.body);
    await hotlines.save();
    res.status(201).json(hotlines);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a contact
const updateEmergencyHotlines = async (req, res) => {
  try {
    const updateHotlines = await Hotlines.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateHotlines) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updateHotlines);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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
};

export { getEmergencyHotlines, addEmergencyHotlines, updateEmergencyHotlines, deleteEmergencyHotlines };  // Exporting controller functions

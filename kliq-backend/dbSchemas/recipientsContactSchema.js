import mongoose from 'mongoose';

const EmergencyContacts = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'],
    },
    isEmergencyContact: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

const Contact = mongoose.model('Contact', EmergencyContacts);

export default Contact;

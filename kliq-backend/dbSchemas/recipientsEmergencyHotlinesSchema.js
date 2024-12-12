import mongoose from 'mongoose';

const EmergencyHotlines = new mongoose.Schema(
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
    isEmergencyHotlines: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

const Hotlines = mongoose.model('Hotlines', EmergencyHotlines);

export default Hotlines;

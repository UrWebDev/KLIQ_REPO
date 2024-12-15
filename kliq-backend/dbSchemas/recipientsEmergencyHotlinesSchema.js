import mongoose from 'mongoose';

const EmergencyHotlinesSchema = new mongoose.Schema(
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
    recipientId: {
      type: String,
      required: true,
    },
    isEmergencyHotline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

const Hotlines = mongoose.model('Hotlines', EmergencyHotlinesSchema);

export default Hotlines;

import mongoose from 'mongoose';

const EmergencyContacts = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
}, { timestamps: true });

const Contact = mongoose.model('Contact', EmergencyContacts);


export default Contact;

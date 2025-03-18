import mongoose from "mongoose";

const sosMessageSchema = new mongoose.Schema({
  longitude: String,
  latitude: String,
  message: String,
  receivedAt: { type: Date, default: Date.now },
  recipientId: { type: [String], required: true }, // Link SOS messages to recipients
  name: String,
  phoneNUM: String,
  deviceId: String,
});

const SOSModel = mongoose.model("Sos Messages", sosMessageSchema);

export default SOSModel;

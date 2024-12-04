import mongoose from "mongoose";

const sosMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  longitude: String,
  latitude: String,
  message: String,
  receivedAt: { type: Date, default: Date.now },
});

const SOSModel = mongoose.model("SosMessage", sosMessageSchema);



  export default SOSModel;
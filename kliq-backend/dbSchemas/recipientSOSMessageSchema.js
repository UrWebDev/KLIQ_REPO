import mongoose from "mongoose";

const sosMessageSchema = new mongoose.Schema({
    longitude: String,
    latitude: String,
    message: String,
    receivedAt: { type: Date, default: Date.now },
  });
  
  const SOSModel = mongoose.model("Sos Message", sosMessageSchema);

  export default SOSModel;
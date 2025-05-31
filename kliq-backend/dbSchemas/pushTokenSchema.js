// dbSchemas/pushTokenSchema.js
import mongoose from "mongoose";

const pushTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
});

const PushToken = mongoose.model("PushToken", pushTokenSchema);

export default PushToken;

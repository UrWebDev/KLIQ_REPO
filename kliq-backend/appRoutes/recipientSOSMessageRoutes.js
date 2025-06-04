import SOSModel from "../dbSchemas/recipientSOSMessageSchema.js";
import PushToken from "../dbSchemas/pushTokenSchema.js";
import fetch from "node-fetch";

// Push notification helper - UPDATED FOR BACKGROUND SOUND
const sendPushNotification = async (to, message) => {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        sound: "default",
        title: "🚨 New SOS Alert",
        body: message,
        priority: "high", // Ensure delivery in background
        ttl: 60, // Time to live (seconds)
      }),
    });
  } catch (err) {
    console.error("Failed to send push notification:", err);
  }
};

const receiveRecipientSOSMessage = async (req, res) => {
  let { longitude, latitude, message, recipientId, deviceId, name, phoneNUM} = req.body;

  // Parse recipientId if it's a JSON string
  if (typeof recipientId === 'string') {
    try {
      recipientId = JSON.parse(recipientId);
    } catch (error) {
      return res.status(400).send("Invalid recipientId format.");
    }
  }

  if (!longitude || !latitude || !message || !recipientId || !deviceId || !name || !phoneNUM) {
    return res.status(400).send("Incomplete data received.");
  }

  try {
    // Save SOS message
    const sos = new SOSModel({ longitude, latitude, message, recipientId, deviceId, name, phoneNUM});
    await sos.save();

    // Send notifications
    for (const id of recipientId) {
      const tokenDoc = await PushToken.findOne({ userId: id });
      if (tokenDoc?.token) {
        const alertMessage = `🚨 ${name} triggered an SOS: "${message}"`;
        await sendPushNotification(tokenDoc.token, alertMessage);
      }
    }

    res.status(200).send("SOS message received, saved, and notifications sent.");
  } catch (error) {
    console.error("Error processing SOS message:", error);
    res.status(500).json({ message: "Server error while processing SOS message" });
  }
};



const getFilteredSOSMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;

    const sosMessages = await SOSModel.find({ recipientId });
    if (!sosMessages.length) {
      return sosMessages
    }

    res.status(200).json(sosMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

const getUserFilteredSOSreports = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const sosMessages = await SOSModel.find({ deviceId });
    if (!sosMessages.length) {
     return sosMessages
    }

    res.status(200).json(sosMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}
const deleteSOSMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    await SOSModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export { receiveRecipientSOSMessage, getFilteredSOSMessages, getUserFilteredSOSreports,deleteSOSMessageById};

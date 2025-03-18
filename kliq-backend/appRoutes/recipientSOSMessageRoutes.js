import SOSModel from "../dbSchemas/recipientSOSMessageSchema.js";

//receive an http request from the device
//receive sms from device
const receiveRecipientSOSMessage = async (req, res) => {
  let { longitude, latitude, message, recipientId, deviceId, name, phoneNUM } = req.body;

  // If recipientId is a string (i.e., JSON format), convert it into an array
  if (typeof recipientId === 'string') {
    try {
      recipientId = JSON.parse(recipientId);  // Parse the stringified JSON array into an actual array
    } catch (error) {
      return res.status(400).send("Invalid recipientId format.");
    }
  }

  // Validation check for required fields
  if (!longitude || !latitude || !message || !recipientId || !deviceId || !name || !phoneNUM) {
    return res.status(400).send("Incomplete data received.");
  }

  try {
    const sos = new SOSModel({ longitude, latitude, message, recipientId, deviceId, name, phoneNUM });
    await sos.save();

    res.status(200).send("SOS message received and saved.");
    console.log("Received recipientId:", recipientId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFilteredSOSMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;

    const sosMessages = await SOSModel.find({ recipientId });
    if (!sosMessages.length) {
      return res.status(404).json({ error: 'No SOS messages found for this recipient' });
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
      return res.status(404).json({ error: 'No SOS messages found for this recipient' });
    }

    res.status(200).json(sosMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


export { receiveRecipientSOSMessage, getFilteredSOSMessages, getUserFilteredSOSreports};

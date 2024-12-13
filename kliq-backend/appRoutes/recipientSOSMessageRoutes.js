import SOSModel from "../dbSchemas/recipientSOSMessageSchema.js";

//receive an http request from the device
//receive sms from device
const receiveRecipientSOSMessage = async (req, res) => {
  const { longitude, latitude, message, recipientId, deviceId } = req.body;

  if (!longitude || !latitude || !message || !recipientId || !deviceId) {
    return res.status(400).send("Incomplete data received.");
  }

  try {
    const sos = new SOSModel({ longitude, latitude, message, recipientId, deviceId });
    await sos.save();

    res.status(200).send("SOS message received and saved.");
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


export { receiveRecipientSOSMessage, getFilteredSOSMessages };
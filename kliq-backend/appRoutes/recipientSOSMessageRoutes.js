import SOSModel from "../dbSchemas/recipientSOSMessageSchema.js";

//receive an http request from the device
//receive sms from device
const receiveRecipientSOSMessage = async (req, res) => {
    const { longitude, latitude, message } = req.body;
  
    if (!longitude || !latitude || !message) {
      return res.status(400).send("Incomplete data received.");
    }
  
    const sos = new SOSModel({ longitude, latitude, message });
    await sos.save();
  
    res.status(200).send("SOS message received and saved.");
  }

  
  const getAllReceivedSOSMessage = async (req,res) => {
      try {
          const sosMessages = await SOSModel.find()
          res.json(sosMessages)
    } catch (error) {
        res.status(500).json({message: error.message})
    }

}
export {receiveRecipientSOSMessage, getAllReceivedSOSMessage};
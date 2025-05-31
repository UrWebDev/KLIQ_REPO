import fetch from "node-fetch"; // add this import at the top of your file

const sendPushNotification = async (to, message) => {
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
    }),
  });
};

export default sendPushNotification
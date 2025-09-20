const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0/702297236311200/messages';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function sendMessage1(recipientId, message) {
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v22.0/702297236311200/messages",
      {
        messaging_product: "whatsapp",
        to: recipientId, // must be string like "917401534638"
        // type: "template",
        type: "text",
        text: { body: message },
        // template: {
        //   name: "hello_world", // or your approved template
        //   language: { code: "en_US" }
        // }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Message sent:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (err) {
    console.error("❌ Error sending message:", err.response?.data || err.message);
  }
}

// Example usage
// sendMessage1("917401534638", "Fuck you baby");


async function sendMessage(recipientId, message) {
  try {
    const response = await axios.post(WHATSAPP_API_URL, {
      messaging_product: 'whatsapp',
      recipient_type: "individual",
      to: recipientId,
      text: { body: message },
    }, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getMessageStatus = async (messageId) => {
  try {
    const response = await axios.get(`${WHATSAPP_API_URL}/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error retrieving message status:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// sendMessage("917401534638", 'Hello from WhatsApp Business Cloud API!').then(response => {
//   console.log('Message sent:', response);
//   console.log(JSON.stringify(response.data, null, 2));
// }).catch(error => {
//   console.error('Error:', error);
// });

// getMessageStatus('wamid.HBgMNTYyMTM1NzYxNjU5FQIAEhgUMzU5RkY0RjA2QjA0RkE3QjA1AA==').then(status => {
//   console.log('Message status:', status);
// }).catch(error => {
//   console.error('Error:', error);
// });

module.exports = {
  sendMessage1,
  getMessageStatus,
};
const whatsappClient = require('./apiClient');
const openAiClient = require('../openai/apiClient');

const handleTextMessage = (message) => {
  console.log(`Received text message: ${message.text.body}`);
  openAiClient.processTenantMessage(message.from, message.text.body).then(response => {
    whatsappClient.sendMessage1(message.from, response);
  });
  // Add logic to respond to the text message using WhatsApp Business Cloud API
};

const handleImageMessage = (message) => {
  console.log(`Received image message with URL: ${message.image.url}`);
  // Add logic to respond to the image message using WhatsApp Business Cloud API
};

const handleVideoMessage = (message) => {
  console.log(`Received video message with URL: ${message.video.url}`);
  // Add logic to respond to the video message using WhatsApp Business Cloud API
};

const handleMessage = (message) => {
  switch (message.type) {
    case 'text':
      handleTextMessage(message);
      break;
    case 'image':
      handleImageMessage(message);
      break;
    case 'video':
      handleVideoMessage(message);
      break;
    default:
      console.log(`Unknown message type: ${message.type}`);
  }
};

module.exports = {
  handleMessage,
};
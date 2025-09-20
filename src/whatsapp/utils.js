const formatMessageForApi = (message) => {
  // Format the message object to match the API requirements
  return {
    messaging_product: "whatsapp",
    to: message.to,
    type: message.type,
    [message.type]: message.content,
  };
};

const parseApiResponse = (response) => {
  // Extract relevant data from the API response
  return {
    status: response.status,
    messageId: response.data.id,
    timestamp: response.data.timestamp,
  };
};

const isValidMessageType = (type) => {
  // Check if the message type is valid for the API
  const validTypes = ['text', 'image', 'video'];
  return validTypes.includes(type);
};

module.exports = {
  formatMessageForApi,
  parseApiResponse,
  isValidMessageType,
};
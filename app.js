const express = require('express');
const bodyParser = require('body-parser');
const webhookRouter = require('./src/routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Use the webhook routes
app.use('/', webhookRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

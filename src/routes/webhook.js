const express = require('express');
const { handleMessage } = require('../whatsapp/messageHandler');

const router = express.Router();

router.post('/', (req, res) => {
  // const message = req.body;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  const message = req.body.entry[0].changes[0].value.messages[0];
  handleMessage(message);
  res.sendStatus(200);
});

module.exports = router;
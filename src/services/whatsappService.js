require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

/**
 * Sends a message via WhatsApp.
 * @param {string} to - the recipient's WhatsApp number 
 * @param {string} body - the content of the message.
 */
async function sendMessage(to, body, mediaUrl) {
  try {
    const messageOptions = {
      from: twilioPhoneNumber,
      to: to,
      body: body,
    };

    // if a mediaUrl is provided, add it to the options
    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    await client.messages.create(messageOptions);
    console.log(`Successfully sent message to ${to}`);
  } catch (error) {
    console.error(`Failed to send message to ${to}. Error: ${error.message}`);
  }
}

module.exports = { sendMessage };
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleIncomingMessage } = require('./src/controllers/messageController.js');
const { connectDB } = require('./src/config/database.js');
const cron = require('node-cron');
const { sendPromotionalOffer } = require('./src/services/promotionService.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Basic route for checking if the server is running
app.get('/', (req, res) => {
    res.send('WhatsApp Bot for Morocco E-commerce is running!');
});

// The webhook endpoint that Twilio will send messages to
app.post('/webhook', handleIncomingMessage);


//Runs at 10:00 AM every 3 days.

cron.schedule('0 10 */3 * *', () => {
    sendPromotionalOffer();
});

// Runs every minute. FOR TESTING

// cron.schedule('* * * * *', () => {
//     console.log('Running test schedule...');
//     sendPromotionalOffer();
// });


// function to start the server
async function startServer() {
    try {
        // Connect to the database before starting the server
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

// Start the server
startServer();
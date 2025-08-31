const { getDB } = require('../config/database');
const { sendMessage } = require('./whatsappService');
const messages = require('../data/messages.json');

async function sendPromotionalOffer() {
  console.log('Running scheduled job: Sending promotional offers...');
  try {
    const db = getDB();
    
    // 1. Get a random product from the database
    const randomProduct = await db.collection('products').aggregate([{ $sample: { size: 1 } }]).toArray();

    if (randomProduct.length === 0) {
      console.log('No products found in the database to promote.');
      return;
    }
    const product = randomProduct[0];

    // 2. Get all active subscribers
    const subscribers = await db.collection('subscribers').find({ isSubscribed: true }).toArray();

    if (subscribers.length === 0) {
      console.log('No active subscribers to send offers to.');
      return;
    }

    console.log(`Found ${subscribers.length} subscribers. Preparing to send offers...`);

    // 3. Loop through each subscriber and send the offer in their language
    for (const subscriber of subscribers) {
      const lang = subscriber.language === 'darija' ? 'darija' : 'french';
      const productDetails = product[lang];
      
      const offermsg = messages.languages[lang].general.offersmsg;
      
      const messageBody = `${offermsg}\n\n📦 *${productDetails.name}*\n📝 ${productDetails.description}\n💰 *Prix: ${productDetails.price}*\n\n باش تكوماندي، كتب "1️⃣"`;

      await sendMessage(subscriber.whatsappId, messageBody, product.imageUrl);
    }

    console.log('Successfully sent offers to all subscribers.');

  } catch (error) {
    console.error('An error occurred while sending promotional offers:', error);
  }
}

module.exports = { sendPromotionalOffer };
const { sendMessage } = require('../services/whatsappService');
const { appendToSheet } = require('../services/googleSheetService');
const { getDB } = require('../config/database');
const messages = require('../data/messages.json');

async function handleOrderFlow(session, userMessage, From) {
    const lang = session.language;
    const subState = session.sub_state;

    switch (subState) {
        case 'ask_name':
            session.order.name = userMessage;
            session.sub_state = 'ask_phone';
            await sendMessage(From, messages.languages[lang].order.askPhone);
            break;
        
        case 'ask_phone':
            session.order.phone = userMessage;
            session.sub_state = 'ask_address';
            await sendMessage(From, messages.languages[lang].order.askAddress);
            break;

        case 'ask_address':
            session.order.address = userMessage;
            session.sub_state = 'ask_product';
            await sendMessage(From, messages.languages[lang].order.askProduct);
            break;

        case 'ask_product':
            session.order.product = userMessage;
            session.sub_state = 'ask_quantity';
            await sendMessage(From, messages.languages[lang].order.askQuantity);
            break;

        case 'ask_quantity':
            session.order.quantity = userMessage;
            session.sub_state = 'confirm';
            
            let confirmMessage = messages.languages[lang].order.confirm
                .replace('{name}', session.order.name)
                .replace('{phone}', session.order.phone)
                .replace('{address}', session.order.address)
                .replace('{product}', session.order.product)
                .replace('{quantity}', session.order.quantity);

            await sendMessage(From, confirmMessage);
            break;
        
        case 'confirm':
            await handleConfirmation(session, userMessage, From);
            break;
    }
}


//confirmation step to finalize or cancel the order
async function handleConfirmation(session, userMessage, From) {
    const lang = session.language;
    const userConfirmation = userMessage.toLowerCase();
    const yesKeywords = ['yes', 'oui', 'نعم', 'اه', 'yeh'];
    const noKeywords = ['no', 'non', 'لا'];

    if (yesKeywords.some(k => userConfirmation.includes(k))) {
        // check if the order collection exists and save the order to MongoDB 
        try {
            const db = getDB();
            //prepare the order object with additional fields
            const orderToSave = { ...session.order, createdAt: new Date(), status: 'confirmed' };
            await db.collection('orders').insertOne(orderToSave);
            console.log('Order saved to MongoDB.');
        } catch (error) {
            console.error("Failed to save order to MongoDB:", error);
        }

        // Save to Google Sheets
       const appendedOrder = await appendToSheet(session.order);
        //check if the order was appended successfully
        console.log(`Order appended to Google Sheets.${appendedOrder}`);


        // finaliser
        await sendMessage(From, messages.languages[lang].general.thanks);
        session.state = 'to_be_deleted';//signal that this session should be deleted

    } else if (noKeywords.some(k => userConfirmation.includes(k))) {
        const cancelMessage = messages.languages[lang].general.cancel;

        // clear session to start fresh next time
        // session.state = 'main_menu'; // or reset the whole session if preferred
        // session.sub_state = null;
        // session.order = null;

        //if i want to save the cancelled orders TO sheets
        // await appendToSheet(session.order);


        await sendMessage(From, cancelMessage);
        // clear session to start fresh next time
        session.state = 'to_be_deleted';//signal that this session should be deleted


    } else {
        const askAgainMessage = messages.languages[lang].order.askAgainMessage;
        await sendMessage(From, askAgainMessage);
    }
}


module.exports = { handleOrderFlow };
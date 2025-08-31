const { detectLanguage } = require('../utils/languageDetector');
const { sendMessage } = require('../services/whatsappService');
const { getDB } = require('../config/database');
const messages = require('../data/messages.json');
const { handleMainMenu } = require('../handlers/mainMenuHandler');
const { handleOrderFlow } = require('../handlers/orderHandler');
const { handleProductFlow } = require('../handlers/productHandler');
const { handleFaqFlow } = require('../handlers/faqHandler');
const { getSession, setSession, deleteSession } = require('../services/sessionService');

// In-memory session storage. For production, i will use MongoDB.
// const userSessions = {};

// GLOBAL HANDLER (detecting voice notes, subscribe/unsubscribe) 
async function handleGlobalActions(req, res) {
    const { From, Body, NumMedia, MediaContentType0 } = req.body;
    const userMessage = Body.trim();
    const lowerCaseMessage = userMessage.toLowerCase();
    const session = await getSession(From) || {};

    //for testing purpose
    // const session = userSessions[From] || {};

    const lang = session.language || 'french';


    // 1. Voice Note Detection//
    if (NumMedia === '1' && MediaContentType0.startsWith('audio/')) {
        const reply = lang === 'darija' 
            ? messages.languages.darija.general.voiceNoteReply
            : messages.languages.french.general.voiceNoteReply;
        await sendMessage(From, reply);
        return true; // Action was handled
    }

    // 2. Subscription Management (if the user chooses to subscribe/unsubscribe)
    // the subscribers are stored in the DB to see if they are already subscribed or not
    if (['subscribe', 'abonner', 'اشتراك'].includes(lowerCaseMessage)) {
        const db = getDB();
        const result = await db.collection('subscribers').updateOne(
            { whatsappId: From },
            { $set: { isSubscribed: true, language: lang }, $setOnInsert: { subscribedAt: new Date() } },
            { upsert: true }
        );
        const reply = result.upsertedCount > 0
            ? messages.languages[lang].general.subscribeConfirm
            : messages.languages[lang].general.alreadySubscribed;
        await sendMessage(From, reply);
        return true; // Action was handled
    }
    
    // 3. Unsubscribe Management (update the user's subscription status in the DB)
    if (['unsubscribe', 'désabonner', 'الغاء الاشتراك'].includes(lowerCaseMessage)) {
        const db = getDB();
        await db.collection('subscribers').updateOne({ whatsappId: From }, { $set: { isSubscribed: false } });
        await sendMessage(From, messages.languages[lang].general.unsubscribeConfirm);
        return true; // Action was handled
    }


    return false; // Nothing happened so pass directly to the flow handlers 
}


// --- MAIN CONTROLLER --- the function that handles incoming messages and routes them based on session state
// it calls the diffrent functions depending on the state of the user (faq, order, product, main menu)

async function handleIncomingMessage(req, res) {
    const { From, Body } = req.body;
    const userMessage = Body.trim();

    // Handle global actions first to see if any were triggered
    const isActionHandled = await handleGlobalActions(req, res);
    if (isActionHandled) {
        res.status(200).send('<Response/>');
        return;
    }

    // Initialize or reset session if needed, or if the users types 'reset'
    let session = await getSession(From);

    //for testing purpose
    // let session = userSessions[From];

    if (!session || userMessage.toLowerCase() === 'reset') {
        await setSession(From, { state: 'awaiting_language_choice' });


        //for testing purpose
        // userSessions[From] = { state: 'awaiting_language_choice' };

        await sendMessage(From, messages.languageDetection.prompt);
        res.status(200).send('<Response/>');
        return;
    }

    // State-based routing (Direct to the appropriate flow based on user choice)
    switch (session.state) {
        // Awaiting Language Choice
        case 'awaiting_language_choice':
            const selectedLanguage = detectLanguage(userMessage);
            if (['darija', 'french'].includes(selectedLanguage)) {
                session.language = selectedLanguage;
                session.state = 'main_menu';
                await handleMainMenu(session, '', From); // Call main menu to show options
            } else {
                
                await sendMessage(From, messages.languageDetection.invalidChoice);
                // await sendMessage(From, " \n\nالمرجو اختيار 1 أو 2.");
            }
            break;

            //Show main menu options
        case 'main_menu':
            await handleMainMenu(session, userMessage, From);
            break;
            
        case 'order_flow':
            await handleOrderFlow(session, userMessage, From);
            break;

        case 'product_flow':
            await handleProductFlow(session, userMessage, From);
            break;
            
        case 'faq_flow':
            await handleFaqFlow(session, userMessage, From);
            break;

        default:
            console.log(`Unknown state: ${session.state}`);
            // Reset session if state is unknown
            await deleteSession(From);

            // for testing purpose
            // delete userSessions[From];
            break;
    }


// Save the updated session state to the database before responding
    if (session && session.state === 'to_be_deleted') {
        await deleteSession(From);
    } else if (session) {
        await setSession(From, session);
    }

    res.status(200).send('<Response/>');

}

module.exports = { handleIncomingMessage };
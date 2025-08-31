const { sendMessage } = require('../services/whatsappService');
const messages = require('../data/messages.json');

async function handleMainMenu(session, userMessage, From) {
    const lang = session.language;
    const menu = messages.languages[lang].menu;

    // If user just entered main menu ,show full menu
    if (!userMessage || userMessage.trim() === '') {
        const fullMenuMessage = `${menu.order}\n${menu.products}\n${menu.faq}\n${menu.help}`;
        await sendMessage(From, fullMenuMessage);
        return;
    }

    // Process user selection from main menu
    switch (userMessage.trim()) {
        case '1': // Order Flow
            session.state = 'order_flow';
            session.sub_state = 'ask_name';
            session.order = {};
            await sendMessage(From, messages.languages[lang].order.askName);
            break;

        case '2': // Products Flow
            session.state = 'product_flow';
            await sendMessage(From, messages.languages[lang].products.categories);
            break;

        case '3': // FAQ Flow
            session.state = 'faq_flow';
            await sendMessage(From, messages.languages[lang].faq.menu);
            break;
            
        case '4': // Help
            const helpMessage = messages.languages[lang].help;
            await sendMessage(From, helpMessage);
            // No state change
            break;

        default:
            const errorMessage = messages.languages[lang].general.error;
            const fullMenuMessageError = `${errorMessage}\n\n${menu.order}\n${menu.products}\n${menu.faq}\n${menu.help}`;
            await sendMessage(From, fullMenuMessageError);
            break;
    }
}

module.exports = { handleMainMenu };

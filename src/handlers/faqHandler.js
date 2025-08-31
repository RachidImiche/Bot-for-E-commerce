const { sendMessage } = require('../services/whatsappService');
const messages = require('../data/messages.json');

//passing the session, usermessage, and From parameters to identify the user and respond accordingly
async function handleFaqFlow(session, userMessage, From) {
    const lang = session.language;
    let faqAnswer = '';

    // determine the FAQ answer based on user input
    switch (userMessage) {
        case '1': faqAnswer = messages.languages[lang].faq.delivery; break;
        case '2': faqAnswer = messages.languages[lang].faq.payment; break;
        case '3': faqAnswer = messages.languages[lang].faq.return; break;
    }

    // if a valid answer is found, send it along with the main menu options
    if (faqAnswer) {
        const menu = messages.languages[lang].menu;
        const fullMenuMessage = `${menu.order}\n${menu.products}\n${menu.faq}\n${menu.help}`;
        await sendMessage(From, `${faqAnswer}\n\n${fullMenuMessage}`);
        session.state = 'main_menu'; // Return to main menu
    } else {
        const errorMessage = messages.languages[lang].general.error;
        const faqMenuMessage = messages.languages[lang].faq.menu;
        await sendMessage(From, `${errorMessage}\n\n${faqMenuMessage}`);
    }
}

module.exports = { handleFaqFlow };
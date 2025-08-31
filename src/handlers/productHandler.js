const { sendMessage } = require('../services/whatsappService');
const { getDB } = require('../config/database');
const messages = require('../data/messages.json');

async function handleProductFlow(session, userMessage, From) {
    const lang = session.language === 'darija' ? 'darija' : 'french';
    let selectedCategory = '';

    switch (userMessage) {
        case '1': selectedCategory = 'Vêtements'; break;
        case '2': selectedCategory = 'Électronique'; break;
        case '3': selectedCategory = 'Cosmétiques'; break;
    }

    if (selectedCategory) {
        const db = getDB();
        const products = await db.collection('products').find({ category: selectedCategory }).toArray();

        if (products.length > 0) {
            const menu = messages.languages[lang].menu;
            const menuText = `\n\n${menu.order}\n${menu.products}\n${menu.faq}\n${menu.help}`;

            for (const [index, product] of products.entries()) {
                const productDetails = product[lang];
                let textMessage = `📦 *${productDetails.name}*\n\n📝 ${productDetails.description}\n💰 *Prix: ${productDetails.price}*`;

                if (index === products.length - 1) {
                    textMessage += menuText; // Attach menu to the last product
                }
                await sendMessage(From, textMessage, product.imageUrl);
            }
        } else {
            const noProductsMessage = messages.languages[lang].products.noProducts;
            await sendMessage(From, noProductsMessage);
        }
        session.state = 'main_menu'; // Go back to the main menu after
    } else {
        const errorMessage = messages.languages[lang].general.error;
        const categoriesMessage = messages.languages[lang].products.categories;
        await sendMessage(From, `${errorMessage}\n\n${categoriesMessage}`);
    }
}

module.exports = { handleProductFlow };
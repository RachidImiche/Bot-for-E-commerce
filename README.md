# WhatsApp E-commerce Bot

A simple yet powerful WhatsApp chatbot for e-commerce in Morocco, designed to automate orders for **Cash on Delivery (COD)** businesses. It's fully bilingual, supporting both **French** and **Moroccan Darija**.

---

## ✨ Key Features

- 🤖 **Automated Order Taking**: Collects all necessary customer details.
- 🌍 **Bilingual Support**: Remembers user's language preference.
- 🛍️ **Product Catalog**: Displays products with images from a database.
- ❓ **FAQ Handling**: Answers common customer questions instantly.
- 📈 **Google Sheets CRM**: Logs every confirmed order automatically.
- 🗓️ **Scheduled Offers**: Sends promotional messages to subscribers.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **API**: Twilio for WhatsApp
- **Database**: MongoDB
- **Integration**: Google Sheets API
- **Scheduler**: node-cron

---

## 🚀 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/RachidImiche/Bot-for-E-commerce.git
cd Bot-for-E-commerce
npm install

```

### 2. Configure Environment

Create a .env file in the project root and add your credentials:

```bash
# .env
NODE_ENV=development
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415...
MONGODB_URI=mongodb+srv://...
GOOGLE_SHEET_ID=...
```

Also, place your credentials.json file (downloaded from Google Cloud) in the project's root directory.

### 3. Run Server

```bash
npm run dev
```

### Connect to Twilio

Use a tool like ngrok to expose your local server to the internet:

```bash
ngrok http 3000
```

Copy the public URL provided by ngrok and paste it into your Twilio WhatsApp Sandbox settings under “When a message comes in”.
➡️ Make sure to add /webhook at the end of the URL.

### ☁️ Deployment

This app is ready for deployment on server-based platforms like Koyeb, Render, or Back4App using the included Dockerfile.
Remember to set up your environment variables in the hosting provider's dashboard.

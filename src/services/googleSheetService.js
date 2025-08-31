require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// function to authenticate with Google Sheets
const getAuth = () => {
  //the correct path based on the environment
  const isProduction = process.env.NODE_ENV === 'production';
  const keyFilePath = isProduction
    ? '/credentials.json' //absolute path on Koyeb(hosting service)
    : path.join(__dirname, '../../credentials.json'); //  relative path for local development

  console.log(`[Auth] Using credentials file from: ${keyFilePath}`);

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  return auth;
};

// function to append a new row of data to the Google Sheet
const appendToSheet = async (orderData) => {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        new Date().toISOString(), // Timestamp
        orderData.name,
        orderData.phone,
        orderData.address,
        orderData.product,
        orderData.quantity,
        'Confirmed' // Status
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });
    
    console.log(`Successfully appended order to Google Sheet: ${response.data.updates.updatedRange}`);
    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error.message);
  }
};

module.exports = { appendToSheet };
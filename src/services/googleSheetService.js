require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Function to authenticate with Google Sheets
const getAuth = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'), // Path to  credentials file
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  return auth;
};

// Function to append a new row of data
const appendToSheet = async (orderData) => {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // the data to append, in the correct column order
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
      range: 'A1', // Appends to the first empty row of the sheet
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


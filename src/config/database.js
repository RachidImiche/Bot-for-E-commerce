require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  if (db) return db; // Return existing connection if it's already there
  try {
    // Connect the client to the server
    await client.connect();
    // Select the database
    db = client.db('whatsapp_bot_db'); 
    console.log("Successfully connected to MongoDB!");
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit if can't connect to the DB
  }
}

// Function to get the database 
const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized! Call connectDB first.');
    }
    return db;
};

module.exports = { connectDB, getDB };
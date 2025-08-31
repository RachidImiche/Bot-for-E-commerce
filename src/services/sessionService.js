const { getDB } = require('../config/database');

// The collection where sessions will be stored
const SESSIONS_COLLECTION = 'sessions';

/**
 * Retrieves a user's session from the database.
 * @param {string} userId - The user's WhatsApp ID (e.g., 'whatsapp:+212...').
 * @returns {Promise<object|null>} The user's session object or null if not found.
 */
async function getSession(userId) {
    try {
        const db = getDB();
        const session = await db.collection(SESSIONS_COLLECTION).findOne({ userId: userId });
        return session ? session.data : null; // Return only the 'data' part of the session
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

/**
 * Creates or updates a user's session in the database.
 * @param {string} userId - The user's WhatsApp ID.
 * @param {object} data - The session data to save.
 */
async function setSession(userId, data) {
    try {
        const db = getDB();
        await db.collection(SESSIONS_COLLECTION).updateOne(
            { userId: userId },
            { $set: { data: data, updatedAt: new Date() } },
            { upsert: true } // Creates the document if it doesn't exist
        );
    } catch (error) {
        console.error('Error setting session:', error);
    }
}

/**
 * Deletes a user's session from the database.
 * @param {string} userId - The user's WhatsApp ID.
 */
async function deleteSession(userId) {
    try {
        const db = getDB();
        await db.collection(SESSIONS_COLLECTION).deleteOne({ userId: userId });
    } catch (error) {
        console.error('Error deleting session:', error);
    }
}

module.exports = { getSession, setSession, deleteSession };
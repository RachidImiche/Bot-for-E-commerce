
//this function detects if the user is writing in Darija or French based on common keywords,also based on user selection of language,keywords
// Common Darija words for detection
const darijaKeywords = [
    'salam', 'السلام', 'شنو', 'بغيت', 'كيفاش', 'فين', 'واش', 'مزيان',
    'شكرا',, 'دابا', 'غادي', 'ديال', 'عندي', 'ماشي', 'هاد'
];

// common French words for detection
const frenchKeywords = [
    'bonjour', 'merci', 'comment', 'pourquoi', 'quand', 'combien',
    'je', 'vous', 'nous', 'avec', 'pour', 'dans', 'sur', 'oui', 'non'
];

function detectLanguage(text) {
    const lowerText = text.toLowerCase();
    
    // Check for explicit language selection
    if (lowerText.includes('1') || lowerText.includes('دارجة') || lowerText.includes('darija')) {
        return 'darija';
    }
    if (lowerText.includes('2') || lowerText.includes('français') || lowerText.includes('french')) {
        return 'french';
    }
    
    // Count keyword matches
    let darijaCount = 0;
    let frenchCount = 0;
    
    darijaKeywords.forEach(word => {
        if (lowerText.includes(word)) darijaCount++;
    });
    
    frenchKeywords.forEach(word => {
        if (lowerText.includes(word)) frenchCount++;
    });
    
    // Return the language with more matches
    if (darijaCount > frenchCount) return 'darija';
    if (frenchCount > darijaCount) return 'french';
    
    // Default to asking for language preference
    return 'unknown';
}

module.exports = { detectLanguage };
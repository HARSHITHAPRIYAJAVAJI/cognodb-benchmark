require('dotenv').config();

/**
 * CognoDB configuration loaded from environment variables.
 * Validates that all required credentials are present before returning.
 * 
 * @throws {Error} If any required environment variable is missing
 * @returns {{uri: string, username: string, password: string}} CognoDB connection configuration
 */
const config = (() => {
    // Extract environment variables
    const uri = process.env.COGNODB_URI;
    const username = process.env.COGNODB_USERNAME;
    const password = process.env.COGNODB_PASSWORD;
    
    // Validate that all required values exist
    const missingVars = [];
    
    if (!uri) {
        missingVars.push('COGNODB_URI');
    }
    
    if (!username) {
        missingVars.push('COGNODB_USERNAME');
    }
    
    if (!password) {
        missingVars.push('COGNODB_PASSWORD');
    }
    
    // Throw a descriptive error if any values are missing
    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}. ` +
            'Please ensure these are set in your .env file or environment.'
        );
    }
    
    return {
        uri,
        username,
        password
    };
})();

module.exports = config;

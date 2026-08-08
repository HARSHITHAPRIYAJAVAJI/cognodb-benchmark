const neo4j = require('neo4j-driver');
const config = require('../config/config');

// Driver instance (singleton pattern)
let driver = null;

/**
 * Establishes a connection to the Neo4j database.
 * Verifies connectivity before returning the driver instance.
 * 
 * @returns {Promise<neo4j.Driver>} The Neo4j driver instance
 * @throws {Error} If connection fails or verification fails
 */
async function connect() {
    // Return existing driver if already connected
    if (driver) {
        return driver;
    }
    
    // Create a new Neo4j driver instance using configuration
    driver = neo4j.driver(
        config.uri,
        neo4j.auth.basic(config.username, config.password)
    );
    
    // Verify connectivity before returning
    try {
        await driver.verifyConnectivity();
        console.log("✅ Connected to CognoDB");
        
    } catch (error) {
        // Clean up driver if verification fails
        await driver.close();
        driver = null;
      throw new Error(
`Unable to connect to CognoDB: ${error.message}`
);
    }
    
    return driver;
}

/**
 * Closes the connection to the Neo4j database.
 * Safely closes the driver instance if it exists.
 * 
 * @returns {Promise<void>}
 */
async function close() {
    if (driver) {
        await driver.close();
        driver = null;
    }
}

module.exports = {
    connect,
    close
};

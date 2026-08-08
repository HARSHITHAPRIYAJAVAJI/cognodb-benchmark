const { connect, close } = require("./cognodb");

/**
 * Verifies the imported graph by counting nodes and relationships.
 * This function only reads data and does not modify the database.
 *
 * @returns {Promise<{
 *   nodeCount: number,
 *   relationshipCount: number
 * }>}
 */
async function verifyDatabase() {
    let driver = null;
    let session = null;

    try {
        // Connect to CognoDB
        console.log("Connecting to CognoDB...");
        driver = await connect();

        // Create a read-only session
        session = driver.session({
            defaultAccessMode: "READ"
        });

        // Count nodes
        console.log("Counting nodes...");

        const nodeResult = await session.run(`
            MATCH (n:Node)
            RETURN count(n) AS nodeCount
        `);

        const nodeCount =
            nodeResult.records[0]
                .get("nodeCount")
                .toNumber();

        console.log(`Node count: ${nodeCount}`);

        // Count relationships
        console.log("Counting relationships...");

        const relationshipResult = await session.run(`
            MATCH (:Node)-[r:CONNECTED_TO]->(:Node)
            RETURN count(r) AS relationshipCount
        `);

        const relationshipCount =
            relationshipResult.records[0]
                .get("relationshipCount")
                .toNumber();

        console.log(`Relationship count: ${relationshipCount}`);

        // Print summary
        console.log("\n========================================");
        console.log("Database Verification Summary");
        console.log("========================================");
        console.log(`Nodes: ${nodeCount}`);
        console.log(`Relationships: ${relationshipCount}`);
        console.log("========================================\n");

        return {
            nodeCount,
            relationshipCount
        };

    } catch (error) {
        console.error(
            "Error during database verification:",
            error.message
        );

        throw error;

    } finally {
        // Close the session
        if (session) {
            await session.close();
            console.log("Session closed");
        }

        // Close the database connection
        if (driver) {
            await close();
            console.log("Database connection closed");
        }
    }
}

module.exports = {
    verifyDatabase
};
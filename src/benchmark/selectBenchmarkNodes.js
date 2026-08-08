const { connect, close } = require("../database/cognodb");

/**
 * Selects deterministic benchmark node IDs from the imported CA-CondMat graph.
 *
 * Retrieves the first 10 node IDs ordered by ID so that the same
 * benchmark inputs can be reused consistently.
 *
 * @returns {Promise<number[]>} Array of benchmark node IDs
 */
async function selectBenchmarkNodes() {
    let driver = null;
    let session = null;

    try {
        console.log("Connecting to CognoDB...");

        driver = await connect();

        // Create a read-only session
        session = driver.session({
            defaultAccessMode: "READ"
        });

        console.log("Selecting benchmark nodes...");

        const result = await session.run(`
            MATCH (n:Node)
            RETURN n.id AS nodeId
            ORDER BY n.id
            LIMIT 10
        `);

        const nodeIds = result.records.map((record) => {
            const value = record.get("nodeId");

            // CognoDB may return numeric properties directly as
            // JavaScript numbers rather than Neo4j Integer objects.
            return typeof value === "number"
                ? value
                : Number(value);
        });

        console.log(
            "Selected benchmark node IDs:",
            nodeIds
        );

        return nodeIds;

    } catch (error) {
        console.error(
            "Error selecting benchmark nodes:",
            error.message
        );

        throw error;

    } finally {
        if (session) {
            await session.close();
            console.log("Session closed");
        }

        if (driver) {
            await close();
            console.log("Database connection closed");
        }
    }
}

module.exports = {
    selectBenchmarkNodes
};
const { loadGraph } = require("./graphLoader");
const { connect, close } = require("../database/cognodb");
const path = require("path");

/**
 * Imports the CA-CondMat graph dataset into CognoDB.
 *
 * The import process:
 * 1. Loads the dataset from disk.
 * 2. Connects to CognoDB.
 * 3. Inserts all unique nodes.
 * 4. Inserts relationships in batches.
 * 5. Measures total import time.
 *
 * @returns {Promise<{
 *   nodes: number,
 *   relationships: number,
 *   importTimeSeconds: number
 * }>}
 */
async function importGraph() {
    let driver = null;
    let session = null;

    const startTime = Date.now();

    try {
        // Resolve the dataset path
        const datasetPath = path.join(
            __dirname,
            "../../datasets/CA-CondMat.txt"
        );

        console.log(`Loading graph data from: ${datasetPath}`);

        // Load and parse the dataset
        const { nodes, relationships } = await loadGraph(datasetPath);

        console.log(
            `Loaded ${nodes.size} unique nodes and ${relationships.length} relationships`
        );

        // Connect to CognoDB
        console.log("Connecting to CognoDB...");
        driver = await connect();

        // Create a database session
        session = driver.session();

        // --------------------------------------------------
        // Insert nodes
        // --------------------------------------------------

        console.log("Inserting nodes...");

        const nodeIds = Array.from(nodes);

        await session.run(
            `
            UNWIND $nodes AS id
            MERGE (:Node {id: id})
            `,
            {
                nodes: nodeIds
            }
        );

        console.log(`Inserted ${nodeIds.length} nodes`);

        // --------------------------------------------------
        // Insert relationships in batches
        // --------------------------------------------------

        console.log("Inserting relationships in batches...");

        const batchSize = 1000;
        const totalRelationships = relationships.length;
        const totalBatches = Math.ceil(
            totalRelationships / batchSize
        );

        for (let i = 0; i < totalRelationships; i += batchSize) {
            const batch = relationships.slice(
                i,
                i + batchSize
            );

            const batchNumber =
                Math.floor(i / batchSize) + 1;

            await session.run(
                `
                UNWIND $relationships AS rel

                MATCH (a:Node {id: rel.source})
                MATCH (b:Node {id: rel.target})

                MERGE (a)-[:CONNECTED_TO]->(b)
                `,
                {
                    relationships: batch
                }
            );

            const processed = Math.min(
                i + batch.length,
                totalRelationships
            );

            console.log(
                `Batch ${batchNumber}/${totalBatches} completed ` +
                `(${processed}/${totalRelationships} relationships)`
            );
        }

        // --------------------------------------------------
        // Calculate import time
        // --------------------------------------------------

        const endTime = Date.now();

        const importTimeSeconds =
            (endTime - startTime) / 1000;

        console.log("");
        console.log("========================================");
        console.log("Graph import completed successfully");
        console.log("========================================");
        console.log(`Nodes: ${nodeIds.length}`);
        console.log(`Relationships: ${totalRelationships}`);
        console.log(
            `Import time: ${importTimeSeconds.toFixed(3)} seconds`
        );

        return {
            nodes: nodeIds.length,
            relationships: totalRelationships,
            importTimeSeconds
        };

    } catch (error) {
        console.error(
            "Error during graph import:",
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
    importGraph
};
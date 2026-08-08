const { connect, close } = require("./cognodb");

/**
 * Creates and verifies an index on the Node.id property.
 *
 * The index is used to support efficient point lookups
 * on nodes using their id property.
 *
 * @returns {Promise<Object>} Index verification result
 */
async function createNodeIdIndex() {
    let driver = null;
    let session = null;

    try {
        // ---------------------------------------------
        // Connect to CognoDB
        // ---------------------------------------------

        console.log("Connecting to CognoDB...");

        driver = await connect();

        // Index creation modifies database schema,
        // therefore use a WRITE session.
        session = driver.session({
            defaultAccessMode: "WRITE"
        });

        // ---------------------------------------------
        // Create index
        // ---------------------------------------------

        console.log(
            "Creating index on Node.id property..."
        );

        await session.run(`
            CREATE INDEX node_id_index IF NOT EXISTS
            FOR (n:Node)
            ON (n.id)
        `);

        console.log(
            "Index creation command completed."
        );

        // ---------------------------------------------
        // Verify index
        // ---------------------------------------------

        console.log(
            "Verifying index..."
        );

        const result = await session.run(
            "SHOW INDEXES"
        );

        let indexExists = false;

        console.log(
            "\n========================================"
        );

        console.log(
            "Current Indexes in Database"
        );

        console.log(
            "========================================"
        );

        for (const record of result.records) {

            const indexName =
                record.get("name");

            const indexType =
                record.get("type");

            const label =
                record.get("label");

            const properties =
                record.get("properties");

            const unique =
                record.get("unique");

            console.log(
                `Index: ${indexName}`
            );

            console.log(
                `  Type: ${indexType}`
            );

            console.log(
                `  Label: ${label}`
            );

            console.log(
                `  Properties: ${
                    Array.isArray(properties)
                        ? properties.join(", ")
                        : properties
                }`
            );

            console.log(
                `  Unique: ${unique}`
            );

            if (
                indexName ===
                "node_id_index"
            ) {
                indexExists = true;

                console.log(
                    "  ✅ Node.id index found"
                );
            }

            console.log("---");
        }

        console.log(
            "========================================"
        );

        // ---------------------------------------------
        // Final verification
        // ---------------------------------------------

        if (!indexExists) {
            throw new Error(
                "node_id_index was not found after creation."
            );
        }

        console.log(
            "✅ node_id_index successfully created and verified."
        );

        return {
            indexName: "node_id_index",
            verified: true
        };

    } catch (error) {

        console.error(
            "Error during index creation:",
            error.message
        );

        throw error;

    } finally {

        // ---------------------------------------------
        // Close session
        // ---------------------------------------------

        if (session) {
            await session.close();

            console.log(
                "Session closed"
            );
        }

        // ---------------------------------------------
        // Close database connection
        // ---------------------------------------------

        if (driver) {
            await close();

            console.log(
                "Database connection closed"
            );
        }
    }
}

module.exports = {
    createNodeIdIndex
};
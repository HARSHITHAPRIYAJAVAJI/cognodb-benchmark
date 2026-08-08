const {
    createNodeIdIndex
} = require("./createIndex");

async function main() {
    try {
        await createNodeIdIndex();

        console.log(
            "\nIndex setup completed successfully."
        );

    } catch (error) {
        console.error(
            "\nIndex setup failed:"
        );
        console.error(error.message);

        process.exitCode = 1;
    }
}

main();
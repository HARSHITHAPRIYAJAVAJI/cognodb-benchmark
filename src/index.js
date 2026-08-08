const { importGraph } = require("./loaders/importGraph");

async function main() {
    try {
        const result = await importGraph();

        console.log("\nImport Summary");
        console.log("-------------------------");
        console.log(`Nodes: ${result.nodes}`);
        console.log(`Relationships: ${result.relationships}`);
        console.log(
            `Import time: ${result.importTimeSeconds.toFixed(3)} seconds`
        );
    } catch (error) {
        console.error("\nImport failed:");
        console.error(error.message);

        process.exitCode = 1;
    }
}

main();
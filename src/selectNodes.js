const {
    selectBenchmarkNodes
} = require("./benchmark/selectBenchmarkNodes");

async function main() {
    try {
        const nodeIds = await selectBenchmarkNodes();

        console.log("\nSelected benchmark nodes:");
        console.log(nodeIds);
    } catch (error) {
        console.error("Failed to select benchmark nodes:");
        console.error(error.message);

        process.exitCode = 1;
    }
}

main();
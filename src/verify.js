const { verifyDatabase } = require("./database/verifyDatabase");

async function main() {
    try {
        const result = await verifyDatabase();

        console.log("Verification completed successfully.");
        console.log(result);
    } catch (error) {
        console.error("Verification failed:");
        console.error(error.message);

        process.exitCode = 1;
    }
}

main();
const fs = require("fs").promises;
const path = require("path");

const { runBenchmarks } = require("./benchmark/runBenchmarks");
const {
    runConcurrentBenchmark
} = require("./benchmark/concurrentBenchmark");

async function main() {
    try {
        // ---------------------------------------------
        // Standard read/query benchmarks
        // ---------------------------------------------

        const results = await runBenchmarks();

        // ---------------------------------------------
        // Concurrent read/write benchmark
        // ---------------------------------------------

        console.log("\n");
        console.log("========================================");
        console.log("Running Concurrent Read/Write Benchmark");
        console.log("========================================");

        const concurrentResult =
            await runConcurrentBenchmark({
                concurrency: 10,
                totalOperations: 100
            });

        // ---------------------------------------------
        // Create results directory
        // ---------------------------------------------

        const resultsDir =
            path.join(__dirname, "../results");

        await fs.mkdir(resultsDir, {
            recursive: true
        });

        // ---------------------------------------------
        // Save complete results
        // ---------------------------------------------

        const output = {
            generatedAt: new Date().toISOString(),

            configuration: {
                warmupRuns: 2,
                measuredRuns: 100,
                benchmarkNodes: [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    8,
                    15,
                    16,
                    20
                ]
            },

            queryBenchmarks: results,

            concurrentBenchmark: concurrentResult
        };

        const outputPath =
            path.join(
                resultsDir,
                "cognodb-benchmark-results.json"
            );

        await fs.writeFile(
            outputPath,
            JSON.stringify(output, null, 2),
            "utf-8"
        );

        console.log("\n========================================");
        console.log("ALL BENCHMARKS COMPLETED");
        console.log("========================================");
        console.log(
            `Query benchmark results: ${results.length}`
        );
        console.log(
            `Concurrent throughput: ` +
            `${concurrentResult.throughputOpsPerSec.toFixed(2)} ops/sec`
        );
        console.log(
            `Results saved to: ${outputPath}`
        );
        console.log("========================================\n");

    } catch (error) {
        console.error(
            "\nBenchmark execution failed:"
        );
        console.error(error.message);

        process.exitCode = 1;
    }
}

main();
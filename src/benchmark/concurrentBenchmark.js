const { connect, close } = require("../database/cognodb");
const { performance } = require("perf_hooks");

/**
 * Measures concurrent read/write throughput using the imported CA-CondMat graph.
 *
 * Workload:
 * - 80% reads
 * - 20% writes
 * - 10 concurrent workers
 * - 100 total operations by default
 *
 * Writes create temporary BenchmarkTemp nodes and are cleaned up
 * after the benchmark.
 */
async function runConcurrentBenchmark(options = {}) {
    const concurrency =
        options.concurrency !== undefined
            ? options.concurrency
            : 10;

    const totalOperations =
        options.totalOperations !== undefined
            ? options.totalOperations
            : 100;

    if (
        !Number.isInteger(concurrency) ||
        concurrency <= 0
    ) {
        throw new Error(
            "concurrency must be a positive integer."
        );
    }

    if (
        !Number.isInteger(totalOperations) ||
        totalOperations <= 0
    ) {
        throw new Error(
            "totalOperations must be a positive integer."
        );
    }

    const readOperations =
        Math.floor(totalOperations * 0.8);

    const writeOperations =
        totalOperations - readOperations;

    let driver = null;

    // Unique identifier for THIS benchmark run.
    const runId =
        `benchmark_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;

    try {
        console.log("Connecting to CognoDB...");

        driver = await connect();

        console.log("\n========================================");
        console.log("Concurrent Read/Write Benchmark");
        console.log("========================================");
        console.log(`Concurrency: ${concurrency}`);
        console.log(`Total operations: ${totalOperations}`);
        console.log(
            `Read operations: ${readOperations} (80%)`
        );
        console.log(
            `Write operations: ${writeOperations} (20%)`
        );
        console.log("========================================\n");

        // ---------------------------------------------
        // Build deterministic operation workload
        // ---------------------------------------------

        const operations = [];

        for (let i = 0; i < readOperations; i++) {
            operations.push({
                type: "read",
                nodeId: [1, 2, 3, 4, 5, 6, 8, 15, 16, 20][
                    i % 10
                ]
            });
        }

        for (let i = 0; i < writeOperations; i++) {
            operations.push({
                type: "write",
                benchmarkId: `${runId}_${i}`
            });
        }

        // Shuffle reads/writes so the workload is mixed.
        shuffleArray(operations);

        // ---------------------------------------------
        // Execute workload
        // ---------------------------------------------

        const startTime = performance.now();

        const results = await executeWithConcurrency(
    operations,
    concurrency,
    driver,
    runId
);

        const endTime = performance.now();

        const durationMs =
            endTime - startTime;

        const completedOperations =
            results.filter(
                result => result.success
            ).length;

        const failedOperations =
            results.filter(
                result => !result.success
            ).length;

        const throughputOpsPerSec =
            completedOperations /
            (durationMs / 1000);

        // ---------------------------------------------
        // Print results
        // ---------------------------------------------

        console.log("\n========================================");
        console.log("Concurrent Benchmark Results");
        console.log("========================================");
        console.log(
            `Total operations: ${totalOperations}`
        );
        console.log(
            `Completed operations: ${completedOperations}`
        );
        console.log(
            `Failed operations: ${failedOperations}`
        );
        console.log(
            `Duration: ${durationMs.toFixed(2)} ms`
        );
        console.log(
            `Throughput: ${throughputOpsPerSec.toFixed(2)} ops/sec`
        );
        console.log(
            `Concurrency: ${concurrency}`
        );
        console.log(
            `Read operations: ${readOperations}`
        );
        console.log(
            `Write operations: ${writeOperations}`
        );
        console.log(
            "Read/Write ratio: 80/20"
        );
        console.log("========================================\n");

        return {
            runId,
            totalOperations,
            completedOperations,
            failedOperations,
            durationMs,
            throughputOpsPerSec,
            concurrency,
            readOperations,
            writeOperations,
            readWriteRatio: "80/20"
        };

    } catch (error) {
        console.error(
            "Error during concurrent benchmark:",
            error.message
        );

        throw error;

    } finally {

        // ---------------------------------------------
        // Remove ONLY temporary nodes created by
        // this benchmark run.
        // ---------------------------------------------

        if (driver) {
            const cleanupSession =
                driver.session();

            try {
                await cleanupSession.run(
                    `
                    MATCH (n:BenchmarkTemp)
                    WHERE n.runId = $runId
                    DELETE n
                    `,
                    { runId }
                );

                console.log(
                    "Temporary benchmark data cleaned up."
                );

            } catch (cleanupError) {
                console.error(
                    "Error during benchmark cleanup:",
                    cleanupError.message
                );

            } finally {
                await cleanupSession.close();
            }

            await close();

            console.log(
                "Database connection closed."
            );
        }
    }
}

/**
 * Executes operations with bounded concurrency.
 */
async function executeWithConcurrency(
    operations,
    concurrency,
    driver,
    runId
) {
    const results = [];

    let nextIndex = 0;

    async function worker() {
        while (true) {
            const currentIndex =
                nextIndex++;

            if (
                currentIndex >=
                operations.length
            ) {
                return;
            }

            const operation =
                operations[currentIndex];

            const result =
    await executeOperation(
        operation,
        driver,
        runId
    );

            results.push(result);
        }
    }

    const workers = [];

    const workerCount = Math.min(
        concurrency,
        operations.length
    );

    for (
        let i = 0;
        i < workerCount;
        i++
    ) {
        workers.push(worker());
    }

    await Promise.all(workers);

    return results;
}

/**
 * Executes a single read or write operation.
 */
async function executeOperation(
    operation,
    driver,
    runId
) {
    const session =
        driver.session();

    try {

        if (operation.type === "read") {

            await session.run(
                `
                MATCH (n:Node {id: $nodeId})
                RETURN n.id AS nodeId
                `,
                {
                    nodeId: operation.nodeId
                }
            );

        } else if (
            operation.type === "write"
        ) {

            await session.run(
                `
                CREATE (
                    n:BenchmarkTemp {
                        id: $benchmarkId,
                        runId: $runId
                    }
                )
                `,
                {
                    benchmarkId:
                        operation.benchmarkId,
                    runId
                }
            );

        } else {
            throw new Error(
                `Unknown operation type: ${operation.type}`
            );
        }

        return {
            success: true
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    } finally {
        await session.close();
    }
}

/**
 * Fisher-Yates shuffle.
 */
function shuffleArray(array) {
    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }
}

module.exports = {
    runConcurrentBenchmark
};
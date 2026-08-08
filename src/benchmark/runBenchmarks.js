const { connect, close } = require("../database/cognodb");
const { runBenchmark } = require("./benchmarkRunner");

const {
    traversal1Hop,
    traversal2Hop,
    traversal3Hop
} = require("../queries/traversalQueries");

const {
    lookupById,
    lookupWithDegree,
    lookupNeighbors
} = require("../queries/lookupQueries");

const {
    countNodes,
    countRelationships,
    degreeDistribution
} = require("../queries/aggregationQueries");

const {
    mixedWorkload
} = require("../queries/workloadQueries");

const benchmarkConfig = require("../config/benchmarkConfig");

const { performance } = require("perf_hooks");

/**
 * Main benchmark orchestrator for the CA-CondMat CognoDB benchmark.
 *
 * Executes:
 * - Traversal workloads
 * - Lookup workloads
 * - Aggregation workloads
 * - Mixed workload
 *
 * @returns {Promise<Array>} Complete benchmark results
 */
async function runBenchmarks() {
    let driver = null;
    let session = null;

    const results = [];

    // Deterministic benchmark node IDs selected
    // from the imported CA-CondMat dataset.
    const benchmarkNodeIds = [
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
    ];

    try {
        // ---------------------------------------------
        // Connect to CognoDB
        // ---------------------------------------------

        console.log("Connecting to CognoDB...");

        driver = await connect();

        session = driver.session({
            defaultAccessMode: "READ"
        });

        console.log("Session created for benchmarking");

        // Benchmark configuration
        const benchmarkOptions = {
            warmupRuns: benchmarkConfig.warmupRuns,
            runs: benchmarkConfig.measuredRuns
        };

        console.log("\n========================================");
        console.log("Starting Benchmark Suite");
        console.log("========================================");
        console.log(
            `Warmup runs: ${benchmarkOptions.warmupRuns}`
        );
        console.log(
            `Measured runs: ${benchmarkOptions.runs}`
        );
        console.log(
            `Benchmark nodes: ${benchmarkNodeIds.join(", ")}`
        );
        console.log("========================================\n");

        // =============================================
        // TRAVERSAL BENCHMARKS
        // =============================================

        console.log("--- TRAVERSAL BENCHMARKS ---");

        const traversalQueries = [
            {
                name: "traversal1Hop",
                query: traversal1Hop,
                paramKey: "startId"
            },
            {
                name: "traversal2Hop",
                query: traversal2Hop,
                paramKey: "startId"
            },
            {
                name: "traversal3Hop",
                query: traversal3Hop,
                paramKey: "startId"
            }
        ];

        for (const {
            name,
            query,
            paramKey
        } of traversalQueries) {

            console.log(`\nRunning ${name}...`);

            for (const nodeId of benchmarkNodeIds) {

                const params = {
                    [paramKey]: nodeId
                };

                const result = await runBenchmark(
                    session,
                    query,
                    params,
                    benchmarkOptions
                );

                results.push({
                    category: "TRAVERSAL",
                    workload: name,
                    nodeId,
                    durationsMs: result.durationsMs,
                    averageMs: result.averageMs,
                    minMs: result.minMs,
                    maxMs: result.maxMs,
                    p50Ms: result.p50Ms,
p95Ms: result.p95Ms,
                    recordCount: result.recordCount
                });

                console.log(
                    `  Node ${nodeId}: ` +
                    `${result.averageMs.toFixed(2)}ms avg ` +
                    `(${result.recordCount} records)`
                );
            }
        }

        // =============================================
        // LOOKUP BENCHMARKS
        // =============================================

        console.log("\n--- LOOKUP BENCHMARKS ---");

        const lookupQueries = [
            {
                name: "lookupById",
                query: lookupById,
                paramKey: "nodeId"
            },
            {
                name: "lookupWithDegree",
                query: lookupWithDegree,
                paramKey: "nodeId"
            },
            {
                name: "lookupNeighbors",
                query: lookupNeighbors,
                paramKey: "nodeId"
            }
        ];

        for (const {
            name,
            query,
            paramKey
        } of lookupQueries) {

            console.log(`\nRunning ${name}...`);

            for (const nodeId of benchmarkNodeIds) {

                const params = {
                    [paramKey]: nodeId
                };

                const result = await runBenchmark(
                    session,
                    query,
                    params,
                    benchmarkOptions
                );

                results.push({
                    category: "LOOKUP",
                    workload: name,
                    nodeId,
                    durationsMs: result.durationsMs,
                    averageMs: result.averageMs,
                    minMs: result.minMs,
                    maxMs: result.maxMs,
                    p50Ms: result.p50Ms,
p95Ms: result.p95Ms,
                    recordCount: result.recordCount
                });

                console.log(
                    `  Node ${nodeId}: ` +
                    `${result.averageMs.toFixed(2)}ms avg ` +
                    `(${result.recordCount} records)`
                );
            }
        }

        // =============================================
        // AGGREGATION BENCHMARKS
        // =============================================

        console.log("\n--- AGGREGATION BENCHMARKS ---");

        const aggregationQueries = [
            {
                name: "countNodes",
                query: countNodes
            },
            {
                name: "countRelationships",
                query: countRelationships
            },
            {
                name: "degreeDistribution",
                query: degreeDistribution
            }
        ];

        for (const {
            name,
            query
        } of aggregationQueries) {

            console.log(`\nRunning ${name}...`);

            const result = await runBenchmark(
                session,
                query,
                {},
                benchmarkOptions
            );

            results.push({
                category: "AGGREGATION",
                workload: name,
                nodeId: null,
                durationsMs: result.durationsMs,
                averageMs: result.averageMs,
                minMs: result.minMs,
                maxMs: result.maxMs,
                p50Ms: result.p50Ms,
p95Ms: result.p95Ms,
                recordCount: result.recordCount
            });

            console.log(
                `  ${name}: ` +
                `${result.averageMs.toFixed(2)}ms avg ` +
                `(${result.recordCount} records)`
            );
        }

        // =============================================
        // MIXED WORKLOAD
        // =============================================

        console.log("\n--- MIXED WORKLOAD ---");

        /*
         * The mixed workload consists of multiple operations
         * executed sequentially as one representative workload.
         *
         * We perform the complete sequence during each measured run
         * and measure the total elapsed time.
         */

        for (const nodeId of benchmarkNodeIds) {

            console.log(
                `\nRunning mixed workload for Node ${nodeId}...`
            );

            const mixedDurations = [];
            let mixedRecordCount = 0;

            // -----------------------------------------
            // Warmup runs
            // -----------------------------------------

            for (
                let warmup = 0;
                warmup < benchmarkConfig.warmupRuns;
                warmup++
            ) {
                for (const workload of mixedWorkload) {

                    let params = {};

                    if (
                        workload.category === "traversal"
                    ) {
                        params = {
                            startId: nodeId
                        };
                    } else {
                        params = {
                            nodeId
                        };
                    }

                    await session.run(
                        workload.query,
                        params
                    );
                }
            }

            // -----------------------------------------
            // Measured runs
            // -----------------------------------------

            for (
                let run = 0;
                run < benchmarkConfig.measuredRuns;
                run++
            ) {

                const startTime = performance.now();

                let totalRecords = 0;

                for (const workload of mixedWorkload) {

                    let params = {};

                    if (
                        workload.category === "traversal"
                    ) {
                        params = {
                            startId: nodeId
                        };
                    } else {
                        params = {
                            nodeId
                        };
                    }

                    const result = await session.run(
                        workload.query,
                        params
                    );

                    totalRecords += result.records.length;
                }

                const endTime = performance.now();

                mixedDurations.push(
                    endTime - startTime
                );

                if (run === 0) {
                    mixedRecordCount = totalRecords;
                }
            }

            const mixedAverage =
                mixedDurations.reduce(
                    (sum, duration) =>
                        sum + duration,
                    0
                ) / mixedDurations.length;

            const mixedMin =
                Math.min(...mixedDurations);

            const mixedMax =
    Math.max(...mixedDurations);

// Sort a copy so we can calculate percentiles
const sortedMixedDurations = [
    ...mixedDurations
].sort((a, b) => a - b);

function percentile(values, percentileValue) {
    const index =
        (percentileValue / 100) *
        (values.length - 1);

    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
        return values[lower];
    }

    const weight = index - lower;

    return (
        values[lower] +
        (values[upper] - values[lower]) *
        weight
    );
}

const mixedP50 =
    percentile(sortedMixedDurations, 50);

const mixedP95 =
    percentile(sortedMixedDurations, 95);

results.push({
    category: "MIXED",
    workload: "mixedWorkload",
    nodeId,
    durationsMs: mixedDurations,
    averageMs: mixedAverage,
    minMs: mixedMin,
    maxMs: mixedMax,
    p50Ms: mixedP50,
    p95Ms: mixedP95,
    recordCount: mixedRecordCount
});

            console.log(
                `  Node ${nodeId}: ` +
                `${mixedAverage.toFixed(2)}ms avg ` +
                `(${mixedRecordCount} total records)`
            );
        }

        // =============================================
        // COMPLETION SUMMARY
        // =============================================

        console.log("\n========================================");
        console.log("Benchmark Suite Completed");
        console.log("========================================");
        console.log(
            `Total benchmark results: ${results.length}`
        );
        console.log("========================================\n");

        return results;

    } catch (error) {

        console.error(
            "Error during benchmark execution:",
            error.message
        );

        throw error;

    } finally {

        // Close session
        if (session) {
            await session.close();
            console.log("Session closed");
        }

        // Close database connection
        if (driver) {
            await close();
            console.log("Database connection closed");
        }
    }
}

module.exports = {
    runBenchmarks
};
const { performance } = require("perf_hooks");

/**
 * Runs a Cypher query benchmark with warmup and measured runs.
 *
 * Returns latency statistics including p50 and p95.
 */
async function runBenchmark(
    session,
    query,
    params = {},
    options = {}
) {
    const warmupRuns =
        options.warmupRuns !== undefined
            ? options.warmupRuns
            : 2;

    const measuredRuns =
        options.runs !== undefined
            ? options.runs
            : 100;

    if (!Number.isInteger(warmupRuns) || warmupRuns < 0) {
        throw new Error(
            "warmupRuns must be a non-negative integer."
        );
    }

    if (!Number.isInteger(measuredRuns) || measuredRuns <= 0) {
        throw new Error(
            "runs must be a positive integer."
        );
    }

    try {
        // -------------------------------
        // Warmup
        // -------------------------------

        for (let i = 0; i < warmupRuns; i++) {
            await session.run(query, params);
        }

        // -------------------------------
        // Measured runs
        // -------------------------------

        const durationsMs = [];
        let recordCount = 0;

        for (let i = 0; i < measuredRuns; i++) {
            const startTime = performance.now();

            const result = await session.run(
                query,
                params
            );

            const endTime = performance.now();

            durationsMs.push(
                endTime - startTime
            );

            if (i === 0) {
                recordCount = result.records.length;
            }
        }

        // -------------------------------
        // Statistics
        // -------------------------------

        const sortedDurations = [
            ...durationsMs
        ].sort((a, b) => a - b);

        const totalMs = durationsMs.reduce(
            (sum, duration) => sum + duration,
            0
        );

        const averageMs =
            totalMs / durationsMs.length;

        const minMs =
            Math.min(...durationsMs);

        const maxMs =
            Math.max(...durationsMs);

        function percentile(sortedValues, percentile) {
            const index =
                (percentile / 100) *
                (sortedValues.length - 1);

            const lower = Math.floor(index);
            const upper = Math.ceil(index);

            if (lower === upper) {
                return sortedValues[lower];
            }

            const weight = index - lower;

            return (
                sortedValues[lower] +
                (sortedValues[upper] -
                    sortedValues[lower]) *
                    weight
            );
        }

        const p50Ms = percentile(
            sortedDurations,
            50
        );

        const p95Ms = percentile(
            sortedDurations,
            95
        );

        return {
            durationsMs,
            averageMs,
            minMs,
            maxMs,
            p50Ms,
            p95Ms,
            recordCount
        };

    } catch (error) {
        throw new Error(
            `Benchmark execution failed: ${error.message}`
        );
    }
}

module.exports = {
    runBenchmark
};
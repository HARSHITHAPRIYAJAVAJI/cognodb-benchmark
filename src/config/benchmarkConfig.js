const benchmarkConfig = {
    // Warmup executions excluded from measurements
    warmupRuns: 2,

    // Required measured iterations
    measuredRuns: 5,

    // Dataset processing batch size
    batchSize: 1000
};

module.exports = benchmarkConfig;
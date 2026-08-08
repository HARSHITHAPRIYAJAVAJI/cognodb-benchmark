# CognoDB Graph Database Benchmark

## Objective

This project benchmarks CognoDB Cloud using the CA-CondMat graph dataset. The benchmark measures graph query performance, mixed workloads, aggregation queries, and concurrent read/write throughput using a reproducible benchmarking methodology.

---

## Database

- CognoDB Cloud

---

## Dataset

Dataset: CA-CondMat

Graph Statistics:

- Nodes: 23,133
- Relationships: 186,936

---

## Benchmark Workloads

### Traversal Queries

- 1-Hop Traversal
- 2-Hop Traversal
- 3-Hop Traversal

### Lookup Queries

- Lookup by ID
- Lookup with Degree
- Lookup Neighbors

### Aggregation Queries

- Count Nodes
- Count Relationships
- Degree Distribution

### Mixed Workload

- Point Lookup
- Graph Traversal
- Degree Calculation

### Concurrent Benchmark

- 80% Read Operations
- 20% Write Operations
- 10 Concurrent Workers
- 100 Total Operations

---

## Benchmark Configuration

- Warmup Runs: 2
- Measured Runs: 100

---

## Results

The benchmark automatically generates:

```
results/
└── cognodb-benchmark-results.json
```

The JSON report contains:

- Average latency
- Minimum latency
- Maximum latency
- P50 latency
- P95 latency
- Record counts
- Concurrent throughput

---

## Project Structure

```
src/
├── benchmark/
├── config/
├── database/
├── loaders/
├── queries/
├── utils/

results/
```

---

## Running

Install dependencies

```bash
npm install
```

Import dataset

```bash
node src/index.js
```

Verify dataset

```bash
node src/verify.js
```

Run benchmark suite

```bash
node src/runBenchmarkSuite.js
```

---

## Output

Benchmark results are saved to:

```
results/cognodb-benchmark-results.json
```
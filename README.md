# CognoDB Graph Database Benchmark

## Objective

This project benchmarks CognoDB Cloud using the CA-CondMat graph dataset. The benchmark measures graph query performance, lookup operations, graph traversals, aggregation queries, mixed workloads, and concurrent read/write throughput using a reproducible benchmarking methodology.

---

## Database

- CognoDB Cloud

---

## Dataset

**Dataset:** CA-CondMat

**Graph Statistics**

- Nodes: 23,133
- Relationships: 186,936

---

## Benchmark Methodology

The benchmark follows a reproducible methodology by executing the same workloads on the imported graph dataset using a fixed benchmark configuration.

Benchmark configuration:

- Warmup Runs: 2
- Measured Runs: 100
- Deterministic benchmark node IDs
- Concurrent workload:
  - 80% Read operations
  - 20% Write operations
  - 10 Concurrent workers
  - 100 Total operations

The benchmark records:

- Average latency
- Minimum latency
- Maximum latency
- P50 latency
- P95 latency
- Record count
- Concurrent throughput (operations/second)

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

## Results

The benchmark automatically generates the following report:

```
results/
└── cognodb-benchmark-results.json
```

The generated report contains:

- Average latency
- Minimum latency
- Maximum latency
- P50 latency
- P95 latency
- Record counts
- Concurrent throughput
- Mixed workload benchmark results
- Traversal benchmark results
- Lookup benchmark results
- Aggregation benchmark results

The benchmark completed successfully on the CA-CondMat dataset and produced benchmark results for all implemented workloads. The concurrent benchmark achieved approximately **20.66 operations per second** with **100 successful operations** and **0 failed operations** using an **80% read / 20% write** workload.

## Analysis

The benchmark was executed successfully on the CA-CondMat graph dataset containing 23,133 nodes and 186,936 relationships.

Point lookup queries perform direct node access using the indexed Node.id property, while traversal queries require exploring graph relationships.

Traversal queries required following graph relationships, resulting in increased execution time as traversal depth increased from one hop to three hops.

Aggregation queries processed larger portions of the graph to compute graph-wide statistics such as node counts, relationship counts, and degree distributions.

The mixed workload benchmark combined lookup, traversal, and aggregation operations to simulate a realistic graph database workload.

The concurrent benchmark executed 100 operations with an 80% read and 20% write workload using 10 concurrent workers. The benchmark completed successfully and measured the concurrent throughput of the database under load.

Overall, the benchmark demonstrates the performance characteristics of CognoDB Cloud across multiple graph query workloads using a reproducible benchmarking methodology.

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

### Install dependencies

```bash
npm install
```

### Import dataset

```bash
node src/index.js
```

### Verify imported graph

```bash
node src/verify.js
```

### Create index

```bash
node src/database/runCreateIndex.js
```

### Run benchmark suite

```bash
node src/runBenchmarkSuite.js
```

---
## Output

A complete benchmark report is generated automatically and stored in:

```text
results/cognodb-benchmark-results.json
```

The benchmark report contains all latency statistics, throughput measurements, and workload-specific benchmark results generated during execution.
## Future Work

Future improvements include:

- Benchmarking additional graph databases such as Neo4j AuraDB, Memgraph, FalkorDB, and Apache AGE.
- Running concurrency benchmarks with multiple worker counts.
- Comparing warm and cold query performance.
- Visualizing benchmark results using charts and graphs.
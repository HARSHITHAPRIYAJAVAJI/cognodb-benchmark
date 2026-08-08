/**
 * Aggregation query definitions for the CA-CondMat graph benchmark.
 * Each query performs graph-wide aggregations and statistical calculations.
 * 
 * Graph structure: (:Node {id: number})-[:CONNECTED_TO]->(:Node)
 */

// Count all nodes with the Node label
const countNodes = `
MATCH (n:Node)
RETURN count(n) AS nodeCount
`;

// Count all CONNECTED_TO relationships
const countRelationships = `
MATCH ()-[r:CONNECTED_TO]->()
RETURN count(r) AS relationshipCount
`;

// Calculate degree distribution: for each degree value, count how many nodes have that degree
const degreeDistribution = `
MATCH (n:Node)
OPTIONAL MATCH (n)-[r:CONNECTED_TO]->()
WITH n, count(r) AS degree
RETURN degree, count(n) AS nodeCount
ORDER BY degree ASC
`;

module.exports = {
    countNodes,
    countRelationships,
    degreeDistribution
};

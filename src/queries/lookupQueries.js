/**
 * Lookup query definitions for the CA-CondMat graph benchmark.
 * Each query performs node lookups with varying levels of detail.
 * 
 * Graph structure: (:Node {id: number})-[:CONNECTED_TO]->(:Node)
 */

// Simple node lookup by ID
const lookupById = `
MATCH (n:Node {id: $nodeId})
RETURN n.id AS nodeId
`;

// Node lookup with degree calculation (number of outgoing relationships)
const lookupWithDegree = `
MATCH (n:Node {id: $nodeId})
OPTIONAL MATCH (n)-[r:CONNECTED_TO]->()
RETURN n.id AS nodeId, count(r) AS degree
`;

// Node lookup with neighbor IDs (directly connected nodes)
const lookupNeighbors = `
MATCH (n:Node {id: $nodeId})-[:CONNECTED_TO]->(neighbor:Node)
RETURN DISTINCT neighbor.id AS neighborId
`;

module.exports = {
    lookupById,
    lookupWithDegree,
    lookupNeighbors
};

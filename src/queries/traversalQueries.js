/**
 * Traversal query definitions for the CA-CondMat graph benchmark.
 * Each query performs a graph traversal starting from a given node ID
 * and returns the distinct IDs of reachable nodes at the specified hop distance.
 * 
 * Graph structure: (:Node {id: number})-[:CONNECTED_TO]->(:Node)
 */

// 1-hop traversal: Find all nodes reachable by exactly 1 CONNECTED_TO relationship
const traversal1Hop = `
MATCH (start:Node {id: $startId})-[:CONNECTED_TO]->(target:Node)
RETURN DISTINCT target.id AS nodeId
`;

// 2-hop traversal: Find all nodes reachable by exactly 2 CONNECTED_TO relationships
const traversal2Hop = `
MATCH (start:Node {id: $startId})-[:CONNECTED_TO]->()-[:CONNECTED_TO]->(target:Node)
RETURN DISTINCT target.id AS nodeId
`;

// 3-hop traversal: Find all nodes reachable by exactly 3 CONNECTED_TO relationships
const traversal3Hop = `
MATCH (start:Node {id: $startId})-[:CONNECTED_TO]->()-[:CONNECTED_TO]->()-[:CONNECTED_TO]->(target:Node)
RETURN DISTINCT target.id AS nodeId
`;

module.exports = {
    traversal1Hop,
    traversal2Hop,
    traversal3Hop
};

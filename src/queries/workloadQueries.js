/**
 * Mixed workload query definitions for the CA-CondMat graph benchmark.
 *
 * Defines an ordered sequence of representative operations:
 * - Point lookup
 * - 1-hop traversal
 * - 2-hop traversal
 * - Node degree calculation
 *
 * Graph structure:
 * (:Node {id: number})-[:CONNECTED_TO]->(:Node)
 */

const mixedWorkload = [
    {
        name: "Point Lookup",
        category: "lookup",
        query: `
            MATCH (n:Node {id: $nodeId})
            RETURN n.id AS nodeId
        `,
        paramDescription: {
            nodeId: "ID of the node to look up"
        }
    },

    {
        name: "1-Hop Traversal",
        category: "traversal",
        query: `
            MATCH (start:Node {id: $startId})
                  -[:CONNECTED_TO]->
                  (target:Node)
            RETURN DISTINCT target.id AS nodeId
        `,
        paramDescription: {
            startId: "ID of the starting node"
        }
    },

    {
        name: "2-Hop Traversal",
        category: "traversal",
        query: `
            MATCH (start:Node {id: $startId})
                  -[:CONNECTED_TO]->
                  ()
                  -[:CONNECTED_TO]->
                  (target:Node)
            RETURN DISTINCT target.id AS nodeId
        `,
        paramDescription: {
            startId: "ID of the starting node"
        }
    },

    {
        name: "Node Degree Calculation",
        category: "aggregation",
        query: `
            MATCH (n:Node {id: $nodeId})
            OPTIONAL MATCH (n)-[r:CONNECTED_TO]->()
            RETURN n.id AS nodeId, count(r) AS degree
        `,
        paramDescription: {
            nodeId: "ID of the node whose outgoing degree is calculated"
        }
    }
];

module.exports = {
    mixedWorkload
};
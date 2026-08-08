const fs = require("fs").promises;

async function loadGraph(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, "utf8");

        const lines = fileContent.split(/\r?\n/);

        const nodes = new Set();
        const relationships = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) continue;

            const parts = trimmed.split(/\s+/);

            if (parts.length !== 2) continue;

            const source = Number(parts[0]);
            const target = Number(parts[1]);

            if (Number.isNaN(source) || Number.isNaN(target)) continue;

            nodes.add(source);
            nodes.add(target);

            relationships.push({
                source,
                target
            });
        }

        console.log(`Loaded ${nodes.size} nodes`);
        console.log(`Loaded ${relationships.length} relationships`);

        return {
            nodes,
            relationships
        };

    } catch (error) {
        throw new Error(`Failed to load graph file: ${error.message}`);
    }
}

module.exports = {
    loadGraph
};
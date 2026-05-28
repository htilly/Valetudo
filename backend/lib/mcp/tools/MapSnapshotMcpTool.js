class MapSnapshotMcpTool {
    static getDefinition() {
        return {
            name: "take_map_snapshot",
            description: "List or restore map snapshots. Use 'list' to see available snapshots, 'restore' to restore one by ID.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["list", "restore"],
                        description: "'list' returns available snapshots, 'restore' restores a snapshot by its ID",
                        default: "list"
                    },
                    snapshot_id: {
                        type: "string",
                        description: "The snapshot ID to restore (only used with 'restore' action)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "list";

        if (action === "restore") {
            if (!args.snapshot_id) {
                return {content: [{type: "text", text: "snapshot_id is required for restore action"}], isError: true};
            }

            const snapshots = await capability.getSnapshots();
            const snapshot = snapshots.find(s => s.id === args.snapshot_id);

            if (!snapshot) {
                return {content: [{type: "text", text: `Snapshot '${args.snapshot_id}' not found`}], isError: true};
            }

            await capability.restoreSnapshot(snapshot);
            return {content: [{type: "text", text: `Snapshot '${args.snapshot_id}' restored`}]};
        }

        const snapshots = await capability.getSnapshots();
        const snapshotData = snapshots.map(s => ({
            id: s.id,
            timestamp: s.metaData?.timestamp
        }));

        return {content: [{type: "text", text: JSON.stringify(snapshotData, null, 2)}]};
    }
}

module.exports = MapSnapshotMcpTool;

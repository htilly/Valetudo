class MapResetMcpTool {
    static getDefinition() {
        return {
            name: "reset_map",
            description: "Reset the robot's map data. This will delete the current map. Use with caution.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        await capability.reset();
        return {content: [{type: "text", text: "Map has been reset"}]};
    }
}

module.exports = MapResetMcpTool;

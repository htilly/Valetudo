class MappingPassMcpTool {
    static getDefinition() {
        return {
            name: "start_mapping_pass",
            description: "Start a dedicated mapping pass. The robot will explore and build a map without cleaning.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        await capability.startMapping();
        return {content: [{type: "text", text: "Mapping pass started"}]};
    }
}

module.exports = MappingPassMcpTool;

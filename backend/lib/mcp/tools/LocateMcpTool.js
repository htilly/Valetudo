class LocateMcpTool {
    static getDefinition() {
        return {
            name: "locate",
            description: "Locate the robot vacuum by playing a sound or flashing a light so you can find it.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        await capability.locate();
        return {content: [{type: "text", text: "Locate signal sent. Listen for the sound or look for the light."}]};
    }
}

module.exports = LocateMcpTool;

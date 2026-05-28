class SpeakerTestMcpTool {
    static getDefinition() {
        return {
            name: "test_speaker",
            description: "Play a test sound on the robot's speaker to verify it's working.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        await capability.playTestSound();
        return {content: [{type: "text", text: "Test sound played"}]};
    }
}

module.exports = SpeakerTestMcpTool;

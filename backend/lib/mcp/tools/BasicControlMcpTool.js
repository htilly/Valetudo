class BasicControlMcpTool {
    static getDefinition() {
        return {
            name: "basic_control",
            description: "Control basic robot vacuum operations. Start or resume cleaning, stop cleaning, pause cleaning, or send the robot back to its dock.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["start", "stop", "pause", "home"],
                        description: "The action to perform: 'start' begins or resumes cleaning, 'stop' stops cleaning, 'pause' pauses the current cleaning, 'home' sends the robot back to its dock"
                    }
                },
                required: ["action"]
            }
        };
    }

    static async execute(capability, args) {
        switch (args.action) {
            case "start":
                await capability.start();
                return {content: [{type: "text", text: "Cleaning started/resumed"}]};
            case "stop":
                await capability.stop();
                return {content: [{type: "text", text: "Cleaning stopped"}]};
            case "pause":
                await capability.pause();
                return {content: [{type: "text", text: "Cleaning paused"}]};
            case "home":
                await capability.home();
                return {content: [{type: "text", text: "Robot returning to dock"}]};
            default:
                return {content: [{type: "text", text: `Unknown action: ${args.action}`}], isError: true};
        }
    }
}

module.exports = BasicControlMcpTool;

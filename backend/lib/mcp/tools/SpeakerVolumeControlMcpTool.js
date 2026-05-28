class SpeakerVolumeControlMcpTool {
    static getDefinition() {
        return {
            name: "set_speaker_volume",
            description: "Set the robot's speaker volume as a percentage (0-100). Use 'get' action to read the current volume.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get", "set"],
                        description: "'get' reads the current volume, 'set' changes it",
                        default: "get"
                    },
                    volume: {
                        type: "integer",
                        minimum: 0,
                        maximum: 100,
                        description: "Volume percentage (0-100, only used with 'set' action)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "get";

        if (action === "get") {
            const volume = await capability.getVolume();
            return {content: [{type: "text", text: `Current speaker volume: ${volume}%`}]};
        }

        if (action === "set") {
            if (args.volume === undefined) {
                return {content: [{type: "text", text: "Volume value is required for set action"}], isError: true};
            }
            await capability.setVolume(args.volume);
            return {content: [{type: "text", text: `Speaker volume set to ${args.volume}%`}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = SpeakerVolumeControlMcpTool;

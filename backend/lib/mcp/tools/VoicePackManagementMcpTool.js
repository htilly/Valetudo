class VoicePackManagementMcpTool {
    static getDefinition() {
        return {
            name: "manage_voice_pack",
            description: "Manage the robot's voice pack. Get the current language, download a new voice pack, or check download status.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get_current", "download", "status"],
                        description: "'get_current' returns the current voice language, 'download' downloads a voice pack, 'status' checks download progress",
                        default: "get_current"
                    },
                    url: {
                        type: "string",
                        description: "URL to download the voice pack from (only for 'download' action)"
                    },
                    language: {
                        type: "string",
                        description: "Language code for the voice pack, lowercase ISO 3166-1 alpha-2 (only for 'download' action)"
                    },
                    hash: {
                        type: "string",
                        description: "Hash or signature for the voice pack (only for 'download' action, if required)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "get_current";

        if (action === "get_current") {
            const language = await capability.getCurrentVoiceLanguage();
            return {content: [{type: "text", text: `Current voice pack language: ${language}`}]};
        }

        if (action === "download") {
            if (!args.url) {
                return {content: [{type: "text", text: "URL is required for download action"}], isError: true};
            }

            const options = {url: args.url};
            if (args.language) {
                options.language = args.language;
            }
            if (args.hash) {
                options.hash = args.hash;
            }

            await capability.downloadVoicePack(options);
            return {content: [{type: "text", text: "Voice pack download initiated"}]};
        }

        if (action === "status") {
            const status = await capability.getVoicePackOperationStatus();
            return {content: [{type: "text", text: JSON.stringify(status, null, 2)}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = VoicePackManagementMcpTool;

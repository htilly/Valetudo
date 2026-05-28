class DoNotDisturbMcpTool {
    static getDefinition() {
        return {
            name: "set_do_not_disturb",
            description: "Configure Do Not Disturb mode. Get or set the time range during which the robot should not make noise or start cleaning automatically.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get", "set"],
                        description: "'get' reads the current DND configuration, 'set' applies a new one",
                        default: "get"
                    },
                    start_hour: {
                        type: "integer",
                        minimum: 0,
                        maximum: 23,
                        description: "DND start hour (0-23, only for 'set' action)"
                    },
                    start_minute: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        description: "DND start minute (0-59, only for 'set' action)"
                    },
                    end_hour: {
                        type: "integer",
                        minimum: 0,
                        maximum: 23,
                        description: "DND end hour (0-23, only for 'set' action)"
                    },
                    end_minute: {
                        type: "integer",
                        minimum: 0,
                        maximum: 59,
                        description: "DND end minute (0-59, only for 'set' action)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "get";

        if (action === "get") {
            const config = await capability.getDndConfiguration();
            return {content: [{type: "text", text: JSON.stringify(config, null, 2)}]};
        }

        if (action === "set") {
            const ValetudoDNDConfiguration = require("../../entities/core/ValetudoDNDConfiguration");
            const dndConfig = new ValetudoDNDConfiguration({
                enabled: true,
                start: {
                    hour: args.start_hour,
                    minute: args.start_minute
                },
                end: {
                    hour: args.end_hour,
                    minute: args.end_minute
                }
            });

            await capability.setDndConfiguration(dndConfig);
            return {content: [{type: "text", text: "Do Not Disturb configuration updated"}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = DoNotDisturbMcpTool;

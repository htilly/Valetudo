class SimpleToggleMcpTool {
    static getDefinition(capabilityType, meta) {
        const isTrigger = meta.name.startsWith("trigger_");

        if (isTrigger) {
            return {
                name: meta.name,
                description: meta.desc,
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            };
        }

        return {
            name: meta.name,
            description: meta.desc,
            inputSchema: {
                type: "object",
                properties: {
                    enabled: {
                        type: "boolean",
                        description: "Set to true to enable, false to disable"
                    }
                },
                required: ["enabled"]
            }
        };
    }

    static async execute(capability, args) {
        const isTrigger = !args || args.enabled === undefined;

        if (isTrigger) {
            if (typeof capability.trigger === "function") {
                await capability.trigger();
            } else {
                await capability.enable();
            }
            return {content: [{type: "text", text: "Action triggered"}]};
        }

        if (args.enabled) {
            await capability.enable();
            return {content: [{type: "text", text: "Feature enabled"}]};
        } else {
            await capability.disable();
            return {content: [{type: "text", text: "Feature disabled"}]};
        }
    }
}

module.exports = SimpleToggleMcpTool;

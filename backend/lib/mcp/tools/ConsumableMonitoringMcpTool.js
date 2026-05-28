class ConsumableMonitoringMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        const availableConsumables = props.availableConsumables || [];

        return {
            name: "get_consumables",
            description: `Get the current status of robot consumables (filters, brushes, etc.)${availableConsumables.length > 0 ? `. Available consumables: ${availableConsumables.map(c => `${c.type}${c.subType ? "/" + c.subType : ""}`).join(", ")}` : ""}. Use 'reset' action to reset a consumable's lifetime counter.`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get", "reset"],
                        description: "'get' reads consumable status, 'reset' resets a consumable's lifetime counter",
                        default: "get"
                    },
                    type: {
                        type: "string",
                        description: "Consumable type to reset (only used with 'reset' action)"
                    },
                    sub_type: {
                        type: "string",
                        description: "Consumable sub-type to reset (only used with 'reset' action, if applicable)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "get";

        if (action === "reset") {
            if (!args.type) {
                return {content: [{type: "text", text: "Consumable 'type' is required for reset action"}], isError: true};
            }
            await capability.resetConsumable(args.type, args.sub_type);
            return {content: [{type: "text", text: `Consumable '${args.type}${args.sub_type ? "/" + args.sub_type : ""}' has been reset`}]};
        }

        const consumables = await capability.getConsumables();
        const consumableData = consumables.map(c => ({
            type: c.type,
            subType: c.subType,
            remaining: c.remaining,
            unit: c.unit
        }));

        return {content: [{type: "text", text: JSON.stringify(consumableData, null, 2)}]};
    }
}

module.exports = ConsumableMonitoringMcpTool;

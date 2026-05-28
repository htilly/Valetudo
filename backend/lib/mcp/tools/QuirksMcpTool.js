class QuirksMcpTool {
    static getDefinition() {
        return {
            name: "set_quirk",
            description: "Read or set device-specific quirks. Quirks are model-specific settings not covered by standard capabilities. Use 'list' to see available quirks, 'set' to change one.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["list", "set"],
                        description: "'list' returns all quirks and their current values, 'set' changes a quirk value",
                        default: "list"
                    },
                    id: {
                        type: "string",
                        description: "The quirk ID to change (only for 'set' action)"
                    },
                    value: {
                        type: "string",
                        description: "The new value for the quirk (only for 'set' action)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "list";

        if (action === "list") {
            const quirks = await capability.getQuirks();
            return {content: [{type: "text", text: JSON.stringify(quirks, null, 2)}]};
        }

        if (action === "set") {
            if (!args.id || args.value === undefined) {
                return {content: [{type: "text", text: "Both 'id' and 'value' are required for set action"}], isError: true};
            }

            await capability.setQuirkValue(args.id, args.value);
            return {content: [{type: "text", text: `Quirk '${args.id}' set to '${args.value}'`}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = QuirksMcpTool;

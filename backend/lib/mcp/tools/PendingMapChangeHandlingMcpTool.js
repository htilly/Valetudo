class PendingMapChangeHandlingMcpTool {
    static getDefinition() {
        return {
            name: "handle_pending_map_change",
            description: "Handle a pending map change detected by the robot. Use 'check' to see if there is a pending change, 'accept' to accept it, or 'reject' to reject it.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["check", "accept", "reject"],
                        description: "'check' queries if there's a pending map change, 'accept' accepts the new map, 'reject' rejects it and keeps the current map",
                        default: "check"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "check";

        if (action === "check") {
            const hasPending = await capability.hasPendingChange();
            return {content: [{type: "text", text: hasPending ? "There is a pending map change" : "No pending map change"}]};
        }

        if (action === "accept") {
            await capability.acceptChange();
            return {content: [{type: "text", text: "Pending map change accepted"}]};
        }

        if (action === "reject") {
            await capability.rejectChange();
            return {content: [{type: "text", text: "Pending map change rejected"}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = PendingMapChangeHandlingMcpTool;

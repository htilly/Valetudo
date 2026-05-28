const ManualControlCapability = require("../../core/capabilities/ManualControlCapability");

class ManualControlMcpTool {
    static getDefinition(capabilityType, capability) {
        const props = capability.getProperties();
        const supportedCommands = props.supportedMovementCommands || Object.values(ManualControlCapability.MOVEMENT_COMMAND_TYPE);
        const isHighRes = capabilityType === "HighResolutionManualControlCapability";

        return {
            name: isHighRes ? "high_res_manual_control" : "manual_control",
            description: `Manually control the robot vacuum movement. Supported commands: ${supportedCommands.join(", ")}. Use 'enable' action first, then 'move', then 'disable' when done.`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["enable", "disable", "move"],
                        description: "'enable' starts manual control mode, 'disable' ends it, 'move' sends a movement command"
                    },
                    movement: {
                        type: "string",
                        enum: supportedCommands,
                        description: "The movement command to send (only used with 'move' action)"
                    }
                },
                required: ["action"]
            }
        };
    }

    static async execute(capabilityType, capability, args) {
        switch (args.action) {
            case "enable":
                await capability.enableManualControl();
                return {content: [{type: "text", text: "Manual control enabled"}]};
            case "disable":
                await capability.disableManualControl();
                return {content: [{type: "text", text: "Manual control disabled"}]};
            case "move":
                if (!args.movement) {
                    return {content: [{type: "text", text: "Movement command required for 'move' action"}], isError: true};
                }
                await capability.manualControl(args.movement);
                return {content: [{type: "text", text: `Movement command '${args.movement}' executed`}]};
            default:
                return {content: [{type: "text", text: `Unknown action: ${args.action}`}], isError: true};
        }
    }
}

module.exports = ManualControlMcpTool;

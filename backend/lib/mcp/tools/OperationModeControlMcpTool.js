class OperationModeControlMcpTool {
    static getDefinition(capability) {
        const presets = capability.getPresets();
        return {
            name: "set_operation_mode",
            description: "Set the robot vacuum operation mode preset (e.g. vacuum only, mop only, vacuum and mop).",
            inputSchema: {
                type: "object",
                properties: {
                    preset: {
                        type: "string",
                        enum: presets,
                        description: `The operation mode preset to select. Available presets: ${presets.join(", ")}`
                    }
                },
                required: ["preset"]
            }
        };
    }

    static async execute(capability, args) {
        await capability.selectPreset(args.preset);
        return {content: [{type: "text", text: `Operation mode set to '${args.preset}'`}]};
    }
}

module.exports = OperationModeControlMcpTool;

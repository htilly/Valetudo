class FanSpeedControlMcpTool {
    static getDefinition(capability) {
        const presets = capability.getPresets();
        return {
            name: "set_fan_speed",
            description: "Set the robot vacuum fan speed preset. Controls suction power.",
            inputSchema: {
                type: "object",
                properties: {
                    preset: {
                        type: "string",
                        enum: presets,
                        description: `The fan speed preset to select. Available presets: ${presets.join(", ")}`
                    }
                },
                required: ["preset"]
            }
        };
    }

    static async execute(capability, args) {
        await capability.selectPreset(args.preset);
        return {content: [{type: "text", text: `Fan speed set to '${args.preset}'`}]};
    }
}

module.exports = FanSpeedControlMcpTool;

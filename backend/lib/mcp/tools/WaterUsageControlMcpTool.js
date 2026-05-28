class WaterUsageControlMcpTool {
    static getDefinition(capability) {
        const presets = capability.getPresets();
        return {
            name: "set_water_usage",
            description: "Set the robot vacuum water usage/pump preset. Controls mopping water flow.",
            inputSchema: {
                type: "object",
                properties: {
                    preset: {
                        type: "string",
                        enum: presets,
                        description: `The water usage preset to select. Available presets: ${presets.join(", ")}`
                    }
                },
                required: ["preset"]
            }
        };
    }

    static async execute(capability, args) {
        await capability.selectPreset(args.preset);
        return {content: [{type: "text", text: `Water usage set to '${args.preset}'`}]};
    }
}

module.exports = WaterUsageControlMcpTool;

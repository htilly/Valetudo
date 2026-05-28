class PresetSelectionMcpTool {
    static getDefinition(capabilityType, capability, meta) {
        const presets = capability.getPresets ? capability.getPresets() : [];

        return {
            name: meta.name,
            description: `${meta.desc}. Available presets: ${presets.length > 0 ? presets.join(", ") : "check robot capabilities"}.`,
            inputSchema: {
                type: "object",
                properties: {
                    preset: {
                        type: "string",
                        enum: presets.length > 0 ? presets : undefined,
                        description: "The preset to select"
                    }
                },
                required: ["preset"]
            }
        };
    }

    static async execute(capability, args) {
        if (!args.preset) {
            return {content: [{type: "text", text: "Preset value is required"}], isError: true};
        }

        if (typeof capability.selectPreset === "function") {
            await capability.selectPreset(args.preset);
        } else {
            return {content: [{type: "text", text: "Capability does not support preset selection"}], isError: true};
        }

        return {content: [{type: "text", text: `Preset set to '${args.preset}'`}]};
    }
}

module.exports = PresetSelectionMcpTool;

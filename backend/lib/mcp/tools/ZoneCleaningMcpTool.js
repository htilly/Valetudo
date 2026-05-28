class ZoneCleaningMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        return {
            name: "clean_zone",
            description: `Start zone cleaning. Define rectangular zones by two diagonal corners (pA=top-left, pB=bottom-right) in cm. Maximum ${props.zoneCount.max} zone(s), ${props.iterationCount.min}-${props.iterationCount.max} iteration(s).`,
            inputSchema: {
                type: "object",
                properties: {
                    zones: {
                        type: "array",
                        description: "Array of zones to clean. Each zone is defined by two diagonal corners (pA=top-left, pB=bottom-right). The other two corners are automatically computed.",
                        items: {
                            type: "object",
                            properties: {
                                pA_x: {
                                    type: "integer",
                                    description: "Top-left X coordinate in cm"
                                },
                                pA_y: {
                                    type: "integer",
                                    description: "Top-left Y coordinate in cm"
                                },
                                pB_x: {
                                    type: "integer",
                                    description: "Bottom-right X coordinate in cm"
                                },
                                pB_y: {
                                    type: "integer",
                                    description: "Bottom-right Y coordinate in cm"
                                }
                            },
                            required: ["pA_x", "pA_y", "pB_x", "pB_y"]
                        },
                        minItems: 1,
                        maxItems: props.zoneCount.max
                    },
                    iterations: {
                        type: "integer",
                        description: "Number of times to clean each zone",
                        minimum: props.iterationCount.min,
                        maximum: props.iterationCount.max,
                        default: 1
                    }
                },
                required: ["zones"]
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoZone = require("../../entities/core/ValetudoZone");
        const zones = args.zones.map(z => {
            return new ValetudoZone({
                points: {
                    pA: {x: z.pA_x, y: z.pA_y},
                    pB: {x: z.pB_x, y: z.pA_y},
                    pC: {x: z.pB_x, y: z.pB_y},
                    pD: {x: z.pA_x, y: z.pB_y}
                }
            });
        });

        await capability.start({
            zones: zones,
            iterations: args.iterations || 1
        });

        return {content: [{type: "text", text: `Zone cleaning started with ${zones.length} zone(s), ${args.iterations || 1} iteration(s)`}]};
    }
}

module.exports = ZoneCleaningMcpTool;

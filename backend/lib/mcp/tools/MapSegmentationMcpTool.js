class MapSegmentationMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        return {
            name: "clean_segments",
            description: `Clean specific map segments (rooms) by their segment IDs. Supports ${props.iterationCount.min}-${props.iterationCount.max} iteration(s).${props.customOrderSupport ? " Custom ordering supported." : ""}`,
            inputSchema: {
                type: "object",
                properties: {
                    segment_ids: {
                        type: "array",
                        description: "Array of segment IDs to clean. Use the robot_capabilities resource to discover available segment IDs.",
                        items: {type: "string"},
                        minItems: 1
                    },
                    iterations: {
                        type: "integer",
                        description: "Number of times to clean each segment",
                        minimum: props.iterationCount.min,
                        maximum: props.iterationCount.max,
                        default: 1
                    },
                    custom_order: {
                        type: "boolean",
                        description: "Whether to clean segments in the specified order",
                        default: false
                    }
                },
                required: ["segment_ids"]
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");
        const segments = args.segment_ids.map(id => {
            return new ValetudoMapSegment({id: id});
        });

        const options = {
            iterations: args.iterations || 1
        };

        if (args.custom_order !== undefined) {
            options.customOrder = args.custom_order;
        }

        await capability.executeSegmentAction(segments, options);

        return {content: [{type: "text", text: `Segment cleaning started for ${segments.length} segment(s)`}]};
    }
}

module.exports = MapSegmentationMcpTool;

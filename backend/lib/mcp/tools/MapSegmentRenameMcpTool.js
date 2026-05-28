class MapSegmentRenameMcpTool {
    static getDefinition() {
        return {
            name: "rename_map_segment",
            description: "Rename a map segment (room). Provide the segment ID and the new name.",
            inputSchema: {
                type: "object",
                properties: {
                    segment_id: {
                        type: "string",
                        description: "The ID of the segment to rename"
                    },
                    name: {
                        type: "string",
                        description: "The new name for the segment"
                    }
                },
                required: ["segment_id", "name"]
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");
        const segment = new ValetudoMapSegment({id: args.segment_id});

        await capability.renameSegment(segment, args.name);
        return {content: [{type: "text", text: `Segment '${args.segment_id}' renamed to '${args.name}'`}]};
    }
}

module.exports = MapSegmentRenameMcpTool;

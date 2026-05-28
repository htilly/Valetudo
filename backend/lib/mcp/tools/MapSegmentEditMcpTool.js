class MapSegmentEditMcpTool {
    static getDefinition() {
        return {
            name: "edit_map_segment",
            description: "Edit map segments by joining two segments together or splitting a segment. Use 'join' to merge two segments or 'split' to divide one.",
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["join", "split"],
                        description: "'join' merges two segments, 'split' divides a segment by a line defined by two points"
                    },
                    segment_a_id: {
                        type: "string",
                        description: "ID of the first segment (for join) or the segment to split (for split)"
                    },
                    segment_b_id: {
                        type: "string",
                        description: "ID of the second segment (only for join)"
                    },
                    pA: {
                        type: "object",
                        properties: {x: {type: "integer"}, y: {type: "integer"}},
                        description: "First point of the split line (only for split, coordinates in cm)"
                    },
                    pB: {
                        type: "object",
                        properties: {x: {type: "integer"}, y: {type: "integer"}},
                        description: "Second point of the split line (only for split, coordinates in cm)"
                    }
                },
                required: ["action", "segment_a_id"]
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");

        if (args.action === "join") {
            if (!args.segment_b_id) {
                return {content: [{type: "text", text: "segment_b_id is required for join action"}], isError: true};
            }

            const segmentA = new ValetudoMapSegment({id: args.segment_a_id});
            const segmentB = new ValetudoMapSegment({id: args.segment_b_id});

            await capability.joinSegments(segmentA, segmentB);
            return {content: [{type: "text", text: `Segments '${args.segment_a_id}' and '${args.segment_b_id}' joined`}]};
        }

        if (args.action === "split") {
            if (!args.pA || !args.pB) {
                return {content: [{type: "text", text: "pA and pB points are required for split action"}], isError: true};
            }

            const segment = new ValetudoMapSegment({id: args.segment_a_id});

            await capability.splitSegment(segment, args.pA, args.pB);
            return {content: [{type: "text", text: `Segment '${args.segment_a_id}' split`}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${args.action}`}], isError: true};
    }
}

module.exports = MapSegmentEditMcpTool;

class GetRobotMapMcpTool {
    static getDefinition() {
        return {
            name: "get_robot_map",
            description: "Get the current robot vacuum map data including floor layers, walls, segment (room) boundaries, and map entities such as charger position, robot position, virtual walls, no-go zones, and cleaning path.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability, args, options) {
        const map = options.robot.state.map;

        const result = {
            size: map.size,
            pixelSize: map.pixelSize,
            layers: (map.layers || []).map(l => ({
                type: l.type,
                dimensions: l.dimensions,
                segmentIds: l.segmentIds
            })),
            entities: (map.entities || []).map(e => ({
                type: e.type,
                points: e.points,
                metaData: e.metaData
            }))
        };

        return {content: [{type: "text", text: JSON.stringify(result, null, 2)}]};
    }
}

module.exports = GetRobotMapMcpTool;

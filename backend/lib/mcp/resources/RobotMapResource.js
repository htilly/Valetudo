class RobotMapResource {
    constructor(options) {
        this.robot = options.robot;
        this.name = "robot-map";
        this.uri = "valetudo://robot/map";
        this.description = "Current robot vacuum map data including layers (floor, walls, segments) and entities (charger, robot position, virtual walls, zones, path)";
        this.mimeType = "application/json";
    }

    async read(uri) {
        const map = this.robot.state.map;

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

        return {
            contents: [{
                uri: uri.href,
                mimeType: this.mimeType,
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
}

module.exports = RobotMapResource;

class RobotCapabilitiesResource {
    constructor(options) {
        this.robot = options.robot;
        this.name = "robot-capabilities";
        this.uri = "valetudo://robot/capabilities";
        this.description = "List of robot capabilities and their properties. Each capability represents a feature the robot supports (e.g. basic control, fan speed, zone cleaning).";
        this.mimeType = "application/json";
    }

    async read(uri) {
        const capabilities = this.robot.capabilities;
        const result = {};

        Object.keys(capabilities).forEach(type => {
            result[type] = capabilities[type].getProperties();
        });

        return {
            contents: [{
                uri: uri.href,
                mimeType: this.mimeType,
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
}

module.exports = RobotCapabilitiesResource;

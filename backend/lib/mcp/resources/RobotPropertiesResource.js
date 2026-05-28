class RobotPropertiesResource {
    constructor(options) {
        this.robot = options.robot;
        this.name = "robot-properties";
        this.uri = "valetudo://robot/properties";
        this.description = "Robot model information and firmware properties such as manufacturer, model name, and firmware version.";
        this.mimeType = "application/json";
    }

    async read(uri) {
        const result = {
            manufacturer: this.robot.getManufacturer(),
            modelName: this.robot.getModelName(),
            implementation: this.robot.constructor.name,
            properties: this.robot.getProperties()
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

module.exports = RobotPropertiesResource;

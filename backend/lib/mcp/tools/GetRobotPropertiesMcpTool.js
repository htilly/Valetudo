class GetRobotPropertiesMcpTool {
    static getDefinition() {
        return {
            name: "get_robot_properties",
            description: "Get robot model information and firmware properties such as manufacturer, model name, and firmware version.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability, args, options) {
        const result = {
            manufacturer: options.robot.getManufacturer(),
            modelName: options.robot.getModelName(),
            implementation: options.robot.constructor.name,
            properties: options.robot.getProperties()
        };

        return {content: [{type: "text", text: JSON.stringify(result, null, 2)}]};
    }
}

module.exports = GetRobotPropertiesMcpTool;

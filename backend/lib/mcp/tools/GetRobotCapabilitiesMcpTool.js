class GetRobotCapabilitiesMcpTool {
    static getDefinition() {
        return {
            name: "get_robot_capabilities",
            description: "Get a list of all robot capabilities and their properties. Each capability represents a feature the robot supports (e.g. basic control, fan speed, zone cleaning, segment cleaning).",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability, args, options) {
        const capabilities = options.robot.capabilities;
        const result = {};

        Object.keys(capabilities).forEach(type => {
            result[type] = capabilities[type].getProperties();
        });

        return {content: [{type: "text", text: JSON.stringify(result, null, 2)}]};
    }
}

module.exports = GetRobotCapabilitiesMcpTool;

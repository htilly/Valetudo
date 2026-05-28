class GoToLocationMcpTool {
    static getDefinition() {
        return {
            name: "go_to_location",
            description: "Send the robot to a specific location on the map. Use coordinates from the map data (in cm).",
            inputSchema: {
                type: "object",
                properties: {
                    x: {
                        type: "integer",
                        description: "X coordinate in cm"
                    },
                    y: {
                        type: "integer",
                        description: "Y coordinate in cm"
                    }
                },
                required: ["x", "y"]
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoGoToLocation = require("../../entities/core/ValetudoGoToLocation");
        const goToLocation = new ValetudoGoToLocation({
            coordinates: {x: args.x, y: args.y}
        });
        await capability.goTo(goToLocation);
        return {content: [{type: "text", text: `Robot going to location (${args.x}, ${args.y})`}]};
    }
}

module.exports = GoToLocationMcpTool;

const {
    StatusStateAttribute,
    BatteryStateAttribute,
    DockStatusStateAttribute,
    AttachmentStateAttribute
} = require("../../entities/state/attributes");

class GetRobotStateMcpTool {
    static getDefinition() {
        return {
            name: "get_robot_state",
            description: "Get the current robot vacuum state including status (docked, cleaning, idle, error, etc.), battery level and charging state, dock status, and attached accessories (dustbin, mop, water tank).",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability, args, options) {
        const state = options.robot.state;
        const result = {};

        const statusAttr = state.getFirstMatchingAttribute({
            attributeClass: StatusStateAttribute.name
        });
        if (statusAttr) {
            result.status = {
                value: statusAttr.value,
                flag: statusAttr.flag,
                isActiveState: statusAttr.isActiveState,
                error: statusAttr.error
            };
        }

        const batteryAttr = state.getFirstMatchingAttribute({
            attributeClass: BatteryStateAttribute.name
        });
        if (batteryAttr) {
            result.battery = {
                level: batteryAttr.level,
                flag: batteryAttr.flag
            };
        }

        const dockAttr = state.getFirstMatchingAttribute({
            attributeClass: DockStatusStateAttribute.name
        });
        if (dockAttr) {
            result.dock = {
                value: dockAttr.value,
                flag: dockAttr.flag
            };
        }

        const attachmentAttrs = state.getMatchingAttributes({
            attributeClass: AttachmentStateAttribute.name
        });
        if (attachmentAttrs && attachmentAttrs.length > 0) {
            result.attachments = attachmentAttrs.map(a => ({
                type: a.type,
                attached: a.attached
            }));
        }

        return {content: [{type: "text", text: JSON.stringify(result, null, 2)}]};
    }
}

module.exports = GetRobotStateMcpTool;

const {StatusStateAttribute, BatteryStateAttribute, DockStatusStateAttribute, AttachmentStateAttribute} = require("../../entities/state/attributes");

class RobotStateResource {
    constructor(options) {
        this.robot = options.robot;
        this.name = "robot-state";
        this.uri = "valetudo://robot/state";
        this.description = "Current robot vacuum state including status, battery level, dock status, and attachments";
        this.mimeType = "application/json";
    }

    async read(uri) {
        const state = this.robot.state;
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

        return {
            contents: [{
                uri: uri.href,
                mimeType: this.mimeType,
                text: JSON.stringify(result, null, 2)
            }]
        };
    }
}

module.exports = RobotStateResource;

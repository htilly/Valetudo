const {StatusStateAttribute, BatteryStateAttribute, DockStatusStateAttribute} = require("../../entities/state/attributes");

class SummarizeStatusPrompt {
    constructor(options) {
        this.robot = options.robot;
        this.name = "summarize_status";
        this.description = "Summarize the current robot vacuum status including battery level, cleaning state, dock status, and available actions.";
        this.argsSchema = {};
    }

    async execute() {
        const state = this.robot.state;

        const statusAttr = state.getFirstMatchingAttribute({
            attributeClass: StatusStateAttribute.name
        });
        const batteryAttr = state.getFirstMatchingAttribute({
            attributeClass: BatteryStateAttribute.name
        });
        const dockAttr = state.getFirstMatchingAttribute({
            attributeClass: DockStatusStateAttribute.name
        });

        const statusValue = statusAttr ? statusAttr.value : "unknown";
        const isActive = statusAttr ? statusAttr.isActiveState : false;
        const batteryLevel = batteryAttr ? batteryAttr.level : "unknown";
        const batteryFlag = batteryAttr ? batteryAttr.flag : "unknown";
        const dockValue = dockAttr ? dockAttr.value : "unknown";

        let summary = "Robot Status Summary:\n\n";
        summary += `- Manufacturer: ${this.robot.getManufacturer()}\n`;
        summary += `- Model: ${this.robot.getModelName()}\n`;
        summary += `- Status: ${statusValue}${isActive ? " (active)" : ""}\n`;
        summary += `- Battery: ${batteryLevel}% (${batteryFlag})\n`;
        summary += `- Dock: ${dockValue}\n\n`;

        const availableTools = Object.keys(this.robot.capabilities).map(type => {
            switch (type) {
                case "BasicControlCapability":
                    return "basic_control (start/stop/pause/home)";
                case "FanSpeedControlCapability":
                    return "set_fan_speed";
                case "WaterUsageControlCapability":
                    return "set_water_usage";
                case "MapSegmentationCapability":
                    return "clean_segments";
                case "ZoneCleaningCapability":
                    return "clean_zone";
                case "GoToLocationCapability":
                    return "go_to_location";
                default:
                    return type.replace("Capability", "").replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
            }
        });

        summary += `Available actions: ${availableTools.join(", ")}\n\n`;

        if (statusValue === StatusStateAttribute.VALUE.DOCKED && batteryLevel >= 100) {
            summary += "The robot is fully charged and docked. Ready to clean.";
        } else if (isActive) {
            summary += "The robot is currently active (cleaning or moving). You can pause or stop it, or let it continue.";
        } else if (statusValue === StatusStateAttribute.VALUE.IDLE) {
            summary += "The robot is idle. You can start a cleaning session or send it to a location.";
        } else if (statusValue === StatusStateAttribute.VALUE.RETURNING) {
            summary += "The robot is returning to dock. You can pause it or wait for it to dock.";
        } else if (statusValue === StatusStateAttribute.VALUE.ERROR) {
            summary += "The robot is in an error state. Use the diagnose_error prompt for help.";
        }

        return {
            messages: [{
                role: "user",
                content: {type: "text", text: summary}
            }]
        };
    }
}

module.exports = SummarizeStatusPrompt;

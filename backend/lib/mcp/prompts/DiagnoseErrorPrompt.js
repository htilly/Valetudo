const {StatusStateAttribute} = require("../../entities/state/attributes");

class DiagnoseErrorPrompt {
    constructor(options) {
        this.robot = options.robot;
        this.valetudoEventStore = options.valetudoEventStore;
        this.name = "diagnose_error";
        this.description = "Analyze the current error state of the robot and suggest remediation steps. Useful when the robot is in an error state.";
        this.argsSchema = {};
    }

    async execute() {
        const state = this.robot.state;
        const statusAttr = state.getFirstMatchingAttribute({
            attributeClass: StatusStateAttribute.name
        });

        const isInError = statusAttr && statusAttr.value === StatusStateAttribute.VALUE.ERROR;
        const errorDescription = statusAttr?.error?.message ?? "No specific error message available";
        const errorDescriptionCode = statusAttr?.error?.id ?? statusAttr?.error?.description ?? "N/A";

        let context = `The robot vacuum is currently ${isInError ? "in an ERROR state" : "not in an error state"}.\n\n`;

        if (isInError) {
            context += `Error message: ${errorDescription}\n`;
            context += `Error code/description: ${errorDescriptionCode}\n\n`;
        }

        const events = this.valetudoEventStore ? this.valetudoEventStore.getAll() : [];
        const errorEvents = events.filter(e => e.type === "error_state");
        if (errorEvents.length > 0) {
            context += "Recent error events:\n";
            errorEvents.forEach(e => {
                context += `- ${e.message || e.type} (processed: ${e.processed})\n`;
            });
            context += "\n";
        }

        context += `Robot: ${this.robot.getManufacturer()} ${this.robot.getModelName()}\n`;
        context += `Available capabilities: ${Object.keys(this.robot.capabilities).join(", ")}\n\n`;

        if (isInError) {
            context += "Please analyze this error and suggest:\n";
            context += "1. What likely caused this error\n";
            context += "2. Steps the user can take to resolve it\n";
            context += "3. Whether the error can be cleared by using the basic_control tool to start/stop/pause/home\n";
        } else {
            context += "The robot is not currently in an error state. No diagnosis needed, but you can check if there are any consumable warnings or other maintenance needs.";
        }

        return {
            messages: [{
                role: "user",
                content: {type: "text", text: context}
            }]
        };
    }
}

module.exports = DiagnoseErrorPrompt;

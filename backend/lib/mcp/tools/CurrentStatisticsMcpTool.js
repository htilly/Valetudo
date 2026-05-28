class CurrentStatisticsMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        const availableStats = props.availableStatistics || [];

        return {
            name: "get_current_statistics",
            description: `Get the current cleaning session statistics${availableStats.length > 0 ? `. Available statistics: ${availableStats.join(", ")}` : ""}.`,
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        const statistics = await capability.getStatistics();
        const statsData = statistics.map(s => ({
            type: s.type,
            value: s.value,
            unit: s.unit
        }));

        return {content: [{type: "text", text: JSON.stringify(statsData, null, 2)}]};
    }
}

module.exports = CurrentStatisticsMcpTool;

class TotalStatisticsMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        const availableStats = props.availableStatistics || [];

        return {
            name: "get_total_statistics",
            description: `Get the total lifetime statistics of the robot${availableStats.length > 0 ? `. Available statistics: ${availableStats.join(", ")}` : ""}.`,
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

module.exports = TotalStatisticsMcpTool;

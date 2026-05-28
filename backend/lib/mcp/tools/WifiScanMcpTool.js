class WifiScanMcpTool {
    static getDefinition() {
        return {
            name: "scan_wifi",
            description: "Scan for available WiFi networks visible to the robot.",
            inputSchema: {
                type: "object",
                properties: {}
            }
        };
    }

    static async execute(capability) {
        const networks = await capability.scan();
        const networkData = networks.map(n => ({
            ssid: n.ssid,
            signal: n.signal,
            channel: n.metaData?.channel
        }));

        return {content: [{type: "text", text: JSON.stringify(networkData, null, 2)}]};
    }
}

module.exports = WifiScanMcpTool;

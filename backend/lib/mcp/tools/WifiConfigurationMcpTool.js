class WifiConfigurationMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();

        return {
            name: "configure_wifi",
            description: `Get the robot's WiFi status or configure WiFi settings.${props.provisionedReconfigurationSupported ? " Reconfiguration of a provisioned robot is supported." : ""}`,
            inputSchema: {
                type: "object",
                properties: {
                    action: {
                        type: "string",
                        enum: ["get_status", "set_config"],
                        description: "'get_status' returns the current WiFi status, 'set_config' applies new WiFi settings",
                        default: "get_status"
                    },
                    ssid: {
                        type: "string",
                        description: "WiFi SSID (only for 'set_config' action)"
                    },
                    password: {
                        type: "string",
                        description: "WiFi password (only for 'set_config' action)"
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const action = args.action || "get_status";

        if (action === "get_status") {
            const status = await capability.getWifiStatus();
            return {content: [{type: "text", text: JSON.stringify(status, null, 2)}]};
        }

        if (action === "set_config") {
            if (!args.ssid) {
                return {content: [{type: "text", text: "SSID is required for set_config action"}], isError: true};
            }

            const ValetudoWifiConfiguration = require("../../entities/core/ValetudoWifiConfiguration");
            const wifiConfig = new ValetudoWifiConfiguration({
                ssid: args.ssid,
                credentials: args.password ? {type: "wpa2_psk", typeSpecificSettings: {password: args.password}} : undefined
            });

            await capability.setWifiConfiguration(wifiConfig);
            return {content: [{type: "text", text: "WiFi configuration applied"}]};
        }

        return {content: [{type: "text", text: `Unknown action: ${action}`}], isError: true};
    }
}

module.exports = WifiConfigurationMcpTool;

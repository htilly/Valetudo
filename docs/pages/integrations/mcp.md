---
title: MCP
category: Integrations
order: 30
---

# MCP integration

The Model Context Protocol (MCP) allows AI clients such as Claude Desktop, ChatGPT, and any MCP-compatible
application to directly control your robot. When enabled, the MCP endpoint is accessible on the same port
as the Valetudo web interface, protected by the same authentication.

To enable MCP, configure it via Valetudo's web interface (Connectivity → MCP connectivity).

## Overview

MCP exposes the robot's capabilities as standardized tools, resources, and prompts that AI clients can
invoke. This includes:

- **Tools**: Start/stop cleaning, change fan speed, go to locations, clean zones, clean segments, and all
  other robot capabilities
- **Resources**: Robot state, map data, capabilities list, and robot properties at `valetudo://robot/*` URIs
- **Prompts**: Diagnostic helpers such as error diagnosis and status summarization

## Design considerations

Since Valetudo runs on embedded vacuum cleaners with very limited memory (as low as 34 MiB heap), the MCP
implementation uses a stateless design with no persistent session state. Each request is handled
independently. The implementation is a hand-rolled JSON-RPC 2.0 server with zero external dependencies,
adding only ~1.8 MiB to the heap compared to the +12 MiB that the official MCP SDK would require.

MCP is disabled by default, which means zero overhead when not in use.

## Connecting from AI clients

MCP uses the Streamable HTTP transport. The endpoint URL is:

```
http://<ROBOT_IP>/mcp
```

### Claude Desktop

Claude Desktop only supports `stdio` transport, so a proxy is needed. Use
[supergateway](https://github.com/supergateway/supergateway) to bridge Streamable HTTP to stdio.

Add this to your Claude Desktop configuration file at
`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "valetudo": {
      "command": "npx",
      "args": ["-y", "supergateway", "--streamableHttp", "http://<ROBOT_IP>/mcp"]
    }
  }
}
```

Replace `<ROBOT_IP>` with your robot's IP address (e.g. `192.168.1.100`).

After saving the configuration, restart Claude Desktop. The robot's tools and resources will be
automatically discovered.

### Other MCP clients

Any MCP client that supports the Streamable HTTP transport can connect directly to the endpoint URL.
No proxy is needed for clients that natively support HTTP-based MCP transports.

## Authentication

If HTTP Basic Auth is enabled in Valetudo's web server configuration, the MCP endpoint requires the same
credentials. Configure your MCP client or proxy to include the appropriate `Authorization` header.

## Available tools

The available tools depend on the robot's capabilities. Each Valetudo capability type is mapped to one or
more MCP tools. Common tools include:

| Tool | Description |
|------|-------------|
| `basic_control` | Start, stop, pause, or send the robot home |
| `fan_speed_control` | Set the fan speed preset |
| `water_usage_control` | Set the water usage preset |
| `operation_mode_control` | Set the operation mode (vacuum, mop, etc.) |
| `zone_cleaning` | Clean specified zones |
| `segment_cleaning` | Clean specified map segments |
| `go_to_location` | Send the robot to specific coordinates |
| `locate` | Play a sound to locate the robot |
| `persistent_map_control` | Enable or disable the persistent map |
| `consumable_monitoring` | View and reset consumable states |
| `speaker_volume_control` | Set the speaker volume |

And many more, depending on the robot model.

## Available resources

| Resource URI | Description |
|--------------|-------------|
| `valetudo://robot/state` | Current robot state including battery, status, and attachments |
| `valetudo://robot/map` | Current map data |
| `valetudo://robot/capabilities` | List of capabilities the robot supports |
| `valetudo://robot/properties` | Robot properties such as model and firmware version |

## Available prompts

| Prompt | Description |
|--------|-------------|
| `diagnose_error` | Diagnose the current robot error based on state and error information |
| `summarize_status` | Summarize the current robot status including battery, state, and active capabilities |

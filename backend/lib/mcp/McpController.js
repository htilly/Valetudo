const DiagnoseErrorPrompt = require("./prompts/DiagnoseErrorPrompt");
const Logger = require("../Logger");
const McpCapabilityMapper = require("./McpCapabilityMapper");
const RobotCapabilitiesResource = require("./resources/RobotCapabilitiesResource");
const RobotMapResource = require("./resources/RobotMapResource");
const RobotPropertiesResource = require("./resources/RobotPropertiesResource");
const RobotStateResource = require("./resources/RobotStateResource");
const SummarizeStatusPrompt = require("./prompts/SummarizeStatusPrompt");
const Tools = require("../utils/Tools");

const DEFAULT_ENDPOINT = "/mcp";
const MCP_PROTOCOL_VERSION = "2025-03-26";

const JSONRPC_ERRORS = Object.freeze({
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603
});

class McpController {
    /**
     * @param {object} options
     * @param {import("../core/ValetudoRobot")} options.robot
     * @param {import("../Configuration")} options.config
     * @param {import("../ValetudoEventStore")} options.valetudoEventStore
     */
    constructor(options) {
        this.config = options.config;
        this.robot = options.robot;
        this.valetudoEventStore = options.valetudoEventStore;

        this.stats = {
            requests: {
                total: 0,
                errors: 0
            }
        };

        this.tools = [];
        this.resources = [];
        this.prompts = [];

        this.loadConfig();

        if (this.currentConfig.enabled) {
            this.buildRegistry();
            Logger.info("MCP controller initialized (stateless Streamable HTTP, zero external deps)");
        }

        this.config.onUpdate((key) => {
            if (key === "mcp") {
                this.handleConfigUpdated();
            }
        });
    }

    /**
     * @private
     */
    loadConfig() {
        const mcpConfig = this.config.get("mcp");

        this.currentConfig = {
            enabled: mcpConfig.enabled,
            endpoint: mcpConfig.endpoint || DEFAULT_ENDPOINT
        };
    }

    /**
     * @private
     */
    handleConfigUpdated() {
        const wasEnabled = this.currentConfig.enabled;
        this.loadConfig();

        if (wasEnabled && !this.currentConfig.enabled) {
            this.tools = [];
            this.resources = [];
            this.prompts = [];
            Logger.info("MCP server disabled");
        } else if (!wasEnabled && this.currentConfig.enabled) {
            this.buildRegistry();
            Logger.info("MCP server enabled");
        }
    }

    /**
     * @private
     */
    buildRegistry() {
        this.tools = [];
        this.resources = [];
        this.prompts = [];

        const capabilities = this.robot.capabilities;

        Object.keys(capabilities).forEach(capabilityType => {
            const capability = capabilities[capabilityType];
            const toolDef = McpCapabilityMapper.getToolDefinition(capabilityType, capability);

            if (toolDef) {
                this.tools.push({
                    name: toolDef.name,
                    description: toolDef.description,
                    inputSchema: toolDef.inputSchema,
                    capabilityType: capabilityType,
                    capability: capability
                });
            }
        });

        const queryTools = McpCapabilityMapper.getQueryToolDefinitions();
        queryTools.forEach(qt => {
            this.tools.push(qt);
        });

        this.resources = [
            new RobotStateResource({robot: this.robot}),
            new RobotMapResource({robot: this.robot}),
            new RobotCapabilitiesResource({robot: this.robot}),
            new RobotPropertiesResource({robot: this.robot})
        ];

        this.prompts = [
            new DiagnoseErrorPrompt({robot: this.robot, valetudoEventStore: this.valetudoEventStore}),
            new SummarizeStatusPrompt({robot: this.robot})
        ];
    }

    /**
     * @public
     * @returns {Promise<void>}
     */
    async shutdown() {
        this.tools = [];
        this.resources = [];
        this.prompts = [];
    }

    /**
     * @public
     * @returns {{enabled: boolean, endpoint: string, stats: object, toolCount: number, resourceCount: number, promptCount: number}}
     */
    getStatus() {
        return {
            enabled: this.currentConfig.enabled,
            endpoint: this.currentConfig.endpoint,
            stats: this.stats,
            toolCount: this.tools.length,
            resourceCount: this.resources.length,
            promptCount: this.prompts.length
        };
    }

    /**
     * @public
     * @returns {string}
     */
    getEndpoint() {
        return this.currentConfig.endpoint;
    }

    /**
     * @public
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async handleRequest(req, res) {
        if (!this.currentConfig.enabled) {
            res.status(503).json(this.makeError(null, -32000, "MCP server is disabled"));
            return;
        }

        this.stats.requests.total++;

        try {
            const body = req.body;
            const result = await this.dispatch(body);

            if (result === undefined) {
                res.status(202).end();
                return;
            }

            res.json(result);
        } catch (err) {
            this.stats.requests.errors++;
            Logger.error("Error handling MCP request", err);
            if (!res.headersSent) {
                res.status(500).json(this.makeError(null, JSONRPC_ERRORS.INTERNAL_ERROR, "Internal server error"));
            }
        }
    }

    /**
     * @public
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    handleGetRequest(req, res) {
        res.status(405).json(this.makeError(null, -32000, "Method not allowed. Stateless mode does not support SSE."));
    }

    /**
     * @public
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    handleDeleteRequest(req, res) {
        res.status(405).json(this.makeError(null, -32000, "Method not allowed. Stateless mode does not support session termination."));
    }

    /**
     * @private
     * @param {string|null} id
     * @param {number} code
     * @param {string} message
     * @returns {object}
     */
    makeError(id, code, message) {
        return {
            jsonrpc: "2.0",
            error: {code: code, message: message},
            id: id
        };
    }

    /**
     * @private
     * @param {string|null} id
     * @param {object} result
     * @returns {object}
     */
    makeResponse(id, result) {
        return {
            jsonrpc: "2.0",
            result: result,
            id: id
        };
    }

    /**
     * @private
     * @param {object} body
     * @returns {Promise<object|undefined>}
     */
    async dispatch(body) {
        if (!body || typeof body !== "object") {
            return this.makeError(null, JSONRPC_ERRORS.INVALID_REQUEST, "Invalid request body");
        }

        const method = body.method;
        const params = body.params || {};
        const id = body.id ?? null;

        if (body.jsonrpc !== "2.0") {
            return this.makeError(id, JSONRPC_ERRORS.INVALID_REQUEST, "Invalid jsonrpc version");
        }

        switch (method) {
            case "initialize":
                return this.handleInitialize(id, params);
            case "notifications/initialized":
                return undefined;
            case "ping":
                return this.makeResponse(id, {});
            case "tools/list":
                return this.handleToolsList(id);
            case "tools/call":
                return this.handleToolsCall(id, params);
            case "resources/list":
                return this.handleResourcesList(id);
            case "resources/read":
                return this.handleResourcesRead(id, params);
            case "resources/templates/list":
                return this.makeResponse(id, {resourceTemplates: []});
            case "prompts/list":
                return this.handlePromptsList(id);
            case "prompts/get":
                return this.handlePromptsGet(id, params);
            case "logging/setLevel":
                return this.makeResponse(id, {});
            case "completion/complete":
                return this.makeResponse(id, {completion: {values: [], total: 0, hasMore: false}});
            default:
                return this.makeError(id, JSONRPC_ERRORS.METHOD_NOT_FOUND, "Method not found: " + method);
        }
    }

    /**
     * @private
     * @param {string|null} id
     * @param {object} params
     */
    handleInitialize(id, params) {
        const requestedVersion = params.protocolVersion;
        const protocolVersion = (requestedVersion === MCP_PROTOCOL_VERSION) ? MCP_PROTOCOL_VERSION : MCP_PROTOCOL_VERSION;

        return this.makeResponse(id, {
            protocolVersion: protocolVersion,
            capabilities: {
                tools: {listChanged: false},
                resources: {subscribe: false, listChanged: false},
                prompts: {listChanged: false},
                logging: {}
            },
            serverInfo: {
                name: "valetudo-mcp",
                version: Tools.GET_VALETUDO_VERSION()
            }
        });
    }

    /**
     * @private
     * @param {string|null} id
     */
    handleToolsList(id) {
        const tools = this.tools.map(t => {
            return {
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema
            };
        });

        return this.makeResponse(id, {tools: tools});
    }

    /**
     * @private
     * @param {string|null} id
     * @param {object} params
     * @returns {Promise<object>}
     */
    async handleToolsCall(id, params) {
        const toolName = params.name;
        const args = params.arguments || {};

        const tool = this.tools.find(t => {
            return t.name === toolName;
        });

        if (!tool) {
            return this.makeError(id, JSONRPC_ERRORS.INVALID_PARAMS, "Unknown tool: " + toolName);
        }

        try {
            let result;

            if (tool.capabilityType.startsWith("__query_")) {
                result = await McpCapabilityMapper.executeQueryTool(tool.capabilityType, args, {
                    robot: this.robot,
                    valetudoEventStore: this.valetudoEventStore
                });
            } else {
                result = await McpCapabilityMapper.executeTool(tool.capabilityType, tool.capability, args);
            }

            return this.makeResponse(id, result);
        } catch (err) {
            return this.makeResponse(id, {
                content: [{type: "text", text: "Error: " + err.message}],
                isError: true
            });
        }
    }

    /**
     * @private
     * @param {string|null} id
     */
    handleResourcesList(id) {
        const resources = this.resources.map(r => {
            return {
                uri: r.uri,
                name: r.name,
                description: r.description,
                mimeType: r.mimeType
            };
        });

        return this.makeResponse(id, {resources: resources});
    }

    /**
     * @private
     * @param {string|null} id
     * @param {object} params
     * @returns {Promise<object>}
     */
    async handleResourcesRead(id, params) {
        const uri = params.uri;

        const resource = this.resources.find(r => {
            return r.uri === uri;
        });

        if (!resource) {
            return this.makeError(id, JSONRPC_ERRORS.INVALID_PARAMS, "Unknown resource: " + uri);
        }

        try {
            const result = await resource.read({href: uri});
            return this.makeResponse(id, result);
        } catch (err) {
            return this.makeResponse(id, {
                contents: [{
                    uri: uri,
                    mimeType: "application/json",
                    text: JSON.stringify({error: err.message})
                }]
            });
        }
    }

    /**
     * @private
     * @param {string|null} id
     */
    handlePromptsList(id) {
        const prompts = this.prompts.map(p => {
            return {
                name: p.name,
                description: p.description
            };
        });

        return this.makeResponse(id, {prompts: prompts});
    }

    /**
     * @private
     * @param {string|null} id
     * @param {object} params
     * @returns {Promise<object>}
     */
    async handlePromptsGet(id, params) {
        const promptName = params.name;
        const args = params.arguments || {};

        const prompt = this.prompts.find(p => {
            return p.name === promptName;
        });

        if (!prompt) {
            return this.makeError(id, JSONRPC_ERRORS.INVALID_PARAMS, "Unknown prompt: " + promptName);
        }

        try {
            const result = await prompt.execute(args);
            return this.makeResponse(id, result);
        } catch (err) {
            return this.makeResponse(id, {
                messages: [{
                    role: "user",
                    content: {type: "text", text: "Error generating prompt: " + err.message}
                }]
            });
        }
    }
}

module.exports = McpController;

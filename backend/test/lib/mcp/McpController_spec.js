const should = require("should");
const McpController = require("../../../lib/mcp/McpController");

function makeMockConfig(enabled, endpoint) {
    const config = {
        _data: {
            mcp: {
                enabled: enabled,
                endpoint: endpoint || "/mcp"
            }
        },
        get(key) {
            return this._data[key];
        },
        onUpdate() {}
    };

    return config;
}

function makeMockRobot(capabilityTypes) {
    const capabilities = {};
    capabilityTypes.forEach(type => {
        capabilities[type] = {
            getPresets: () => ["low", "medium", "high"],
            getProperties: () => ({}),
            start: () => Promise.resolve(),
            stop: () => Promise.resolve(),
            pause: () => Promise.resolve(),
            home: () => Promise.resolve(),
            enable: () => Promise.resolve(),
            disable: () => Promise.resolve(),
            selectPreset: () => Promise.resolve(),
            locate: () => Promise.resolve(),
            playTestSound: () => Promise.resolve(),
            trigger: () => Promise.resolve(),
            reset: () => Promise.resolve(),
            startMapping: () => Promise.resolve()
        };
    });

    return {
        capabilities: capabilities,
        state: {
            map: {
                size: {x: 100, y: 100},
                pixelSize: 5,
                layers: [],
                entities: []
            },
            getFirstMatchingAttribute: () => null,
            getMatchingAttributes: () => []
        },
        getManufacturer: () => "TestManufacturer",
        getModelName: () => "TestModel",
        getProperties: () => ({})
    };
}

describe("McpController", function () {
    describe("when disabled", function () {
        it("should return 503 for any request", function () {
            const controller = new McpController({
                robot: makeMockRobot([]),
                config: makeMockConfig(false),
                valetudoEventStore: null
            });

            const req = {body: {jsonrpc: "2.0", method: "ping", id: 1, params: {}}};
            const res = {
                _status: null,
                _body: null,
                status(code) {
                    this._status = code;
                    return this;
                },
                json(body) {
                    this._body = body;
                    return this;
                }
            };

            controller.handleRequest(req, res);

            should(res._status).equal(503);
        });
    });

    describe("when enabled", function () {
        let controller;
        let mockRobot;

        beforeEach(function () {
            mockRobot = makeMockRobot([
                "BasicControlCapability",
                "FanSpeedControlCapability",
                "LocateCapability"
            ]);

            controller = new McpController({
                robot: mockRobot,
                config: makeMockConfig(true),
                valetudoEventStore: null
            });
        });

        function dispatch(body) {
            const req = {body: body};
            const res = {
                _status: null,
                _body: null,
                _ended: false,
                status(code) {
                    this._status = code;
                    return this;
                },
                json(body) {
                    this._body = body;
                    return this;
                },
                end() {
                    this._ended = true;
                    return this;
                },
                get headersSent() {
                    return false;
                }
            };

            return new Promise((resolve, reject) => {
                controller.handleRequest(req, res).then(() => {
                    resolve(res);
                }).catch(reject);
            });
        }

        it("should reject invalid request body", async function () {
            const res = await dispatch(null);

            should(res._body.error.code).equal(-32600);
        });

        it("should reject invalid jsonrpc version", async function () {
            const res = await dispatch({jsonrpc: "1.0", method: "ping", id: 1});

            should(res._body.error.code).equal(-32600);
        });

        it("should handle initialize", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {
                    protocolVersion: "2025-03-26",
                    capabilities: {},
                    clientInfo: {name: "test", version: "1.0"}
                }
            });

            should(res._body.result.protocolVersion).equal("2025-03-26");
            should(res._body.result.serverInfo.name).equal("valetudo-mcp");
            should(res._body.result.capabilities.tools).be.an.Object();
            should(res._body.result.capabilities.resources).be.an.Object();
            should(res._body.result.capabilities.prompts).be.an.Object();
        });

        it("should handle ping", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 2,
                method: "ping",
                params: {}
            });

            should(res._body.result).deepEqual({});
        });

        it("should handle notifications/initialized with 202", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                method: "notifications/initialized"
            });

            should(res._status).equal(202);
        });

        it("should handle tools/list", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 3,
                method: "tools/list",
                params: {}
            });

            const toolNames = res._body.result.tools.map(t => t.name);

            should(toolNames).containEql("basic_control");
            should(toolNames).containEql("set_fan_speed");
            should(toolNames).containEql("locate");
            toolNames.length.should.be.greaterThan(0);

            res._body.result.tools.forEach(t => {
                should(t.name).be.a.String();
                should(t.description).be.a.String();
                should(t.inputSchema).be.an.Object();
                should(t.inputSchema.type).equal("object");
            });
        });

        it("should handle tools/call for basic_control", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 4,
                method: "tools/call",
                params: {
                    name: "basic_control",
                    arguments: {action: "home"}
                }
            });

            should(res._body.result.content[0].type).equal("text");
            should(res._body.result.content[0].text).equal("Robot returning to dock");
        });

        it("should handle tools/call for unknown tool", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 5,
                method: "tools/call",
                params: {
                    name: "nonexistent_tool",
                    arguments: {}
                }
            });

            should(res._body.error.code).equal(-32602);
            should(res._body.error.message).containEql("Unknown tool");
        });

        it("should handle resources/list", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 6,
                method: "resources/list",
                params: {}
            });

            const uris = res._body.result.resources.map(r => r.uri);

            should(uris).containEql("valetudo://robot/state");
            should(uris).containEql("valetudo://robot/map");
            should(uris).containEql("valetudo://robot/capabilities");
            should(uris).containEql("valetudo://robot/properties");
        });

        it("should handle resources/read for unknown resource", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 7,
                method: "resources/read",
                params: {uri: "valetudo://robot/nonexistent"}
            });

            should(res._body.error.code).equal(-32602);
            should(res._body.error.message).containEql("Unknown resource");
        });

        it("should handle prompts/list", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 8,
                method: "prompts/list",
                params: {}
            });

            const promptNames = res._body.result.prompts.map(p => p.name);

            should(promptNames).containEql("diagnose_error");
            should(promptNames).containEql("summarize_status");
        });

        it("should handle prompts/get for unknown prompt", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 9,
                method: "prompts/get",
                params: {name: "nonexistent_prompt"}
            });

            should(res._body.error.code).equal(-32602);
            should(res._body.error.message).containEql("Unknown prompt");
        });

        it("should handle logging/setLevel", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 10,
                method: "logging/setLevel",
                params: {level: "info"}
            });

            should(res._body.result).deepEqual({});
        });

        it("should handle completion/complete", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 11,
                method: "completion/complete",
                params: {ref: {type: "ref", name: "test"}, argument: {name: "a", value: "x"}}
            });

            should(res._body.result.completion.values).deepEqual([]);
        });

        it("should handle resources/templates/list", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 12,
                method: "resources/templates/list",
                params: {}
            });

            should(res._body.result.resourceTemplates).deepEqual([]);
        });

        it("should return method not found for unknown method", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 99,
                method: "nonexistent/method",
                params: {}
            });

            should(res._body.error.code).equal(-32601);
        });

        it("should handle GET with 405", function () {
            const req = {};
            const res = {
                _status: null,
                _body: null,
                status(code) {
                    this._status = code;
                    return this;
                },
                json(body) {
                    this._body = body;
                    return this;
                }
            };

            controller.handleGetRequest(req, res);
            should(res._status).equal(405);
        });

        it("should handle DELETE with 405", function () {
            const req = {};
            const res = {
                _status: null,
                _body: null,
                status(code) {
                    this._status = code;
                    return this;
                },
                json(body) {
                    this._body = body;
                    return this;
                }
            };

            controller.handleDeleteRequest(req, res);
            should(res._status).equal(405);
        });

        it("should report correct status", function () {
            const status = controller.getStatus();

            should(status.enabled).equal(true);
            should(status.endpoint).equal("/mcp");
            should(status.toolCount).be.greaterThan(0);
            should(status.resourceCount).equal(4);
            should(status.promptCount).equal(2);
        });

        it("should increment request stats", async function () {
            await dispatch({jsonrpc: "2.0", id: 1, method: "ping", params: {}});

            should(controller.getStatus().stats.requests.total).equal(1);
        });

        it("should include query tools in tools/list", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 20,
                method: "tools/list",
                params: {}
            });

            const toolNames = res._body.result.tools.map(t => t.name);

            should(toolNames).containEql("get_robot_state");
            should(toolNames).containEql("get_robot_map");
            should(toolNames).containEql("get_robot_capabilities");
            should(toolNames).containEql("get_robot_properties");
        });

        it("should execute get_robot_state query tool", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 21,
                method: "tools/call",
                params: {
                    name: "get_robot_state",
                    arguments: {}
                }
            });

            should(res._body.result.content[0].type).equal("text");
            const parsed = JSON.parse(res._body.result.content[0].text);
            should(parsed).be.an.Object();
        });

        it("should execute get_robot_map query tool", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 22,
                method: "tools/call",
                params: {
                    name: "get_robot_map",
                    arguments: {}
                }
            });

            should(res._body.result.content[0].type).equal("text");
            const parsed = JSON.parse(res._body.result.content[0].text);
            should(parsed.size).be.an.Object();
            should(parsed.pixelSize).be.a.Number();
        });

        it("should execute get_robot_capabilities query tool", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 23,
                method: "tools/call",
                params: {
                    name: "get_robot_capabilities",
                    arguments: {}
                }
            });

            should(res._body.result.content[0].type).equal("text");
            const parsed = JSON.parse(res._body.result.content[0].text);
            should(parsed.BasicControlCapability).be.an.Object();
        });

        it("should execute get_robot_properties query tool", async function () {
            const res = await dispatch({
                jsonrpc: "2.0",
                id: 24,
                method: "tools/call",
                params: {
                    name: "get_robot_properties",
                    arguments: {}
                }
            });

            should(res._body.result.content[0].type).equal("text");
            const parsed = JSON.parse(res._body.result.content[0].text);
            should(parsed.manufacturer).equal("TestManufacturer");
            should(parsed.modelName).equal("TestModel");
        });
    });
});

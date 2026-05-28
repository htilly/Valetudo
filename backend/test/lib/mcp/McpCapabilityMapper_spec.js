const should = require("should");
const McpCapabilityMapper = require("../../../lib/mcp/McpCapabilityMapper");

function makeMockCapability(type, extra) {
    const base = {
        getPresets: () => ["low", "medium", "high"],
        getProperties: () => ({}),
        start: () => Promise.resolve(),
        stop: () => Promise.resolve(),
        pause: () => Promise.resolve(),
        home: () => Promise.resolve(),
        enable: () => Promise.resolve(),
        disable: () => Promise.resolve(),
        selectPreset: (p) => Promise.resolve(p),
        locate: () => Promise.resolve(),
        playTestSound: () => Promise.resolve(),
        trigger: () => Promise.resolve(),
        reset: () => Promise.resolve(),
        startMapping: () => Promise.resolve()
    };

    return Object.assign(base, extra || {});
}

describe("McpCapabilityMapper", function () {
    describe("getToolDefinition", function () {
        it("should return null for unknown capability types", function () {
            const result = McpCapabilityMapper.getToolDefinition("SomeUnknownCapability", makeMockCapability("SomeUnknownCapability"));

            should(result).equal(null);
        });

        it("should return a tool definition for BasicControlCapability", function () {
            const result = McpCapabilityMapper.getToolDefinition("BasicControlCapability", makeMockCapability("BasicControlCapability"));

            should(result).not.equal(null);
            should(result.name).equal("basic_control");
            should(result.description).be.a.String();
            should(result.inputSchema).be.an.Object();
            should(result.inputSchema.type).equal("object");
            should(result.inputSchema.properties.action).be.an.Object();
            should(result.inputSchema.properties.action.enum).containEql("start");
            should(result.inputSchema.properties.action.enum).containEql("stop");
            should(result.inputSchema.properties.action.enum).containEql("pause");
            should(result.inputSchema.properties.action.enum).containEql("home");
        });

        it("should return a tool definition for FanSpeedControlCapability", function () {
            const result = McpCapabilityMapper.getToolDefinition("FanSpeedControlCapability", makeMockCapability("FanSpeedControlCapability"));

            should(result).not.equal(null);
            should(result.name).equal("set_fan_speed");
            should(result.inputSchema.properties.preset).be.an.Object();
            should(result.inputSchema.required).containEql("preset");
        });

        it("should return a tool definition for toggle capabilities", function () {
            const result = McpCapabilityMapper.getToolDefinition("CarpetModeControlCapability", makeMockCapability("CarpetModeControlCapability"));

            should(result).not.equal(null);
            should(result.name).equal("set_carpet_mode");
            should(result.inputSchema.properties.enabled).be.an.Object();
            should(result.inputSchema.required).containEql("enabled");
        });

        it("should return a trigger tool for trigger capabilities", function () {
            const result = McpCapabilityMapper.getToolDefinition("AutoEmptyDockManualTriggerCapability", makeMockCapability("AutoEmptyDockManualTriggerCapability"));

            should(result).not.equal(null);
            should(result.name).equal("trigger_auto_empty");
            should(result.inputSchema.properties).deepEqual({});
        });

        it("should return a tool definition for preset capabilities", function () {
            const result = McpCapabilityMapper.getToolDefinition("CarpetSensorModeControlCapability", makeMockCapability("CarpetSensorModeControlCapability"));

            should(result).not.equal(null);
            should(result.name).equal("set_carpet_sensor_mode");
            should(result.inputSchema.properties.preset).be.an.Object();
        });

        it("should return a tool definition for LocateCapability", function () {
            const result = McpCapabilityMapper.getToolDefinition("LocateCapability", makeMockCapability("LocateCapability"));

            should(result).not.equal(null);
            should(result.name).equal("locate");
            should(result.inputSchema.properties).deepEqual({});
        });

        it("should return a tool definition for MapResetCapability", function () {
            const result = McpCapabilityMapper.getToolDefinition("MapResetCapability", makeMockCapability("MapResetCapability"));

            should(result).not.equal(null);
            should(result.name).equal("reset_map");
            should(result.inputSchema.properties).deepEqual({});
        });

        it("should return null for SimpleToggle capability without meta", function () {
            const result = McpCapabilityMapper.getToolDefinition("SimpleToggleMcpTool", makeMockCapability("SimpleToggleMcpTool"));

            should(result).equal(null);
        });
    });

    describe("executeTool", function () {
        it("should throw for unknown capability types", async function () {
            try {
                await McpCapabilityMapper.executeTool("SomeUnknownCapability", makeMockCapability("SomeUnknownCapability"), {});
                throw new Error("Should have thrown");
            } catch (err) {
                should(err.message).containEql("No MCP tool mapping");
            }
        });

        it("should execute BasicControlCapability start", async function () {
            const cap = makeMockCapability("BasicControlCapability");
            let started = false;
            cap.start = () => { started = true; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("BasicControlCapability", cap, {action: "start"});

            should(started).equal(true);
            should(result.content[0].type).equal("text");
            should(result.content[0].text).containEql("started");
        });

        it("should execute BasicControlCapability home", async function () {
            const cap = makeMockCapability("BasicControlCapability");
            let homed = false;
            cap.home = () => { homed = true; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("BasicControlCapability", cap, {action: "home"});

            should(homed).equal(true);
            should(result.content[0].text).containEql("dock");
        });

        it("should execute FanSpeedControlCapability", async function () {
            const cap = makeMockCapability("FanSpeedControlCapability");
            let selectedPreset = null;
            cap.selectPreset = (p) => { selectedPreset = p; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("FanSpeedControlCapability", cap, {preset: "high"});

            should(selectedPreset).equal("high");
            should(result.content[0].text).containEql("high");
        });

        it("should execute toggle capability enable", async function () {
            const cap = makeMockCapability("CarpetModeControlCapability");
            let enabled = false;
            cap.enable = () => { enabled = true; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("CarpetModeControlCapability", cap, {enabled: true});

            should(enabled).equal(true);
            should(result.content[0].text).containEql("enabled");
        });

        it("should execute toggle capability disable", async function () {
            const cap = makeMockCapability("CarpetModeControlCapability");
            let disabled = false;
            cap.disable = () => { disabled = true; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("CarpetModeControlCapability", cap, {enabled: false});

            should(disabled).equal(true);
            should(result.content[0].text).containEql("disabled");
        });

        it("should execute LocateCapability", async function () {
            const cap = makeMockCapability("LocateCapability");
            let located = false;
            cap.locate = () => { located = true; return Promise.resolve(); };

            const result = await McpCapabilityMapper.executeTool("LocateCapability", cap, {});

            should(located).equal(true);
            should(result.content[0].text).containEql("Locate");
        });
    });

    describe("lazy loading", function () {
        it("should load tool modules on demand", function () {
            const result = McpCapabilityMapper.getToolDefinition("BasicControlCapability", makeMockCapability("BasicControlCapability"));

            should(result).not.equal(null);
            should(result.name).equal("basic_control");
        });

        it("should load different tool modules for different capabilities", function () {
            const basic = McpCapabilityMapper.getToolDefinition("BasicControlCapability", makeMockCapability("BasicControlCapability"));
            const fan = McpCapabilityMapper.getToolDefinition("FanSpeedControlCapability", makeMockCapability("FanSpeedControlCapability"));

            should(basic.name).not.equal(fan.name);
        });
    });
});

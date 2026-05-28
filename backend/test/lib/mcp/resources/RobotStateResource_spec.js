const should = require("should");
const {
    StatusStateAttribute,
    BatteryStateAttribute,
    AttachmentStateAttribute
} = require("../../../../lib/entities/state/attributes");
const RobotStateResource = require("../../../../lib/mcp/resources/RobotStateResource");

describe("RobotStateResource", function () {
    it("should have the correct uri and metadata", function () {
        const resource = new RobotStateResource({robot: {state: {}}});

        should(resource.uri).equal("valetudo://robot/state");
        should(resource.name).equal("robot-state");
        should(resource.mimeType).equal("application/json");
        should(resource.description).be.a.String();
    });

    it("should return robot state as JSON content", async function () {
        const statusAttr = new StatusStateAttribute({
            value: StatusStateAttribute.VALUE.DOCKED,
            flag: StatusStateAttribute.FLAG.NONE,
            metaData: {}
        });

        const batteryAttr = new BatteryStateAttribute({
            level: 85,
            flag: BatteryStateAttribute.FLAG.CHARGING,
            metaData: {}
        });

        const attachmentAttr = new AttachmentStateAttribute({
            type: AttachmentStateAttribute.TYPE.DUSTBIN,
            attached: true,
            metaData: {}
        });

        const mockState = {
            attributes: [statusAttr, batteryAttr, attachmentAttr],
            getFirstMatchingAttribute(options) {
                return this.attributes.find(a => a.constructor.name === options.attributeClass) || null;
            },
            getMatchingAttributes(options) {
                return this.attributes.filter(a => a.constructor.name === options.attributeClass);
            }
        };

        const resource = new RobotStateResource({robot: {state: mockState}});
        const result = await resource.read({href: "valetudo://robot/state"});

        should(result.contents.length).equal(1);
        should(result.contents[0].uri).equal("valetudo://robot/state");
        should(result.contents[0].mimeType).equal("application/json");

        const parsed = JSON.parse(result.contents[0].text);
        should(parsed.status).be.an.Object();
        should(parsed.status.value).equal("docked");
        should(parsed.battery).be.an.Object();
        should(parsed.battery.level).equal(85);
        should(parsed.attachments).be.an.Array();
        should(parsed.attachments.length).equal(1);
        should(parsed.attachments[0].type).equal("dustbin");
        should(parsed.attachments[0].attached).equal(true);
    });

    it("should handle empty state gracefully", async function () {
        const mockState = {
            attributes: [],
            getFirstMatchingAttribute() { return null; },
            getMatchingAttributes() { return []; }
        };

        const resource = new RobotStateResource({robot: {state: mockState}});
        const result = await resource.read({href: "valetudo://robot/state"});

        const parsed = JSON.parse(result.contents[0].text);
        should(parsed).not.have.property("status");
        should(parsed).not.have.property("battery");
        should(parsed).not.have.property("attachments");
    });

    it("should use getMatchingAttributes (not getAllMatchingAttributes)", function () {
        const mockState = {
            getFirstMatchingAttribute() { return null; },
            getMatchingAttributes() { return []; }
        };

        const resource = new RobotStateResource({robot: {state: mockState}});

        should(typeof mockState.getMatchingAttributes).equal("function");
        should(typeof mockState.getAllMatchingAttributes).equal("undefined");
    });
});

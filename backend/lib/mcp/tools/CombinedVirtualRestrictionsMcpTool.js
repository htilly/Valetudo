class CombinedVirtualRestrictionsMcpTool {
    static getDefinition(capability) {
        const props = capability.getProperties();
        const supportedTypes = props.supportedRestrictedZoneTypes || ["regular"];

        return {
            name: "set_virtual_restrictions",
            description: `Set virtual walls and restricted zones on the map. Supported restricted zone types: ${supportedTypes.join(", ")}. Coordinates are in cm.`,
            inputSchema: {
                type: "object",
                properties: {
                    virtual_walls: {
                        type: "array",
                        description: "Array of virtual walls. Each wall is a line defined by two points (pA, pB).",
                        items: {
                            type: "object",
                            properties: {
                                pA: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                },
                                pB: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                }
                            },
                            required: ["pA", "pB"]
                        }
                    },
                    restricted_zones: {
                        type: "array",
                        description: "Array of restricted zones. Each zone is a rectangle defined by four corner points (pA, pB, pC, pD).",
                        items: {
                            type: "object",
                            properties: {
                                pA: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                },
                                pB: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                },
                                pC: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                },
                                pD: {
                                    type: "object",
                                    properties: {x: {type: "integer"}, y: {type: "integer"}},
                                    required: ["x", "y"]
                                },
                                type: {
                                    type: "string",
                                    enum: supportedTypes,
                                    description: "Type of restricted zone"
                                }
                            },
                            required: ["pA", "pB", "pC", "pD"]
                        }
                    }
                }
            }
        };
    }

    static async execute(capability, args) {
        const ValetudoRestrictedZone = require("../../entities/core/ValetudoRestrictedZone");
        const ValetudoVirtualRestrictions = require("../../entities/core/ValetudoVirtualRestrictions");
        const ValetudoVirtualWall = require("../../entities/core/ValetudoVirtualWall");

        const virtualWalls = (args.virtual_walls || []).map(w => {
            return new ValetudoVirtualWall({
                points: {
                    pA: {x: w.pA.x, y: w.pA.y},
                    pB: {x: w.pB.x, y: w.pB.y}
                }
            });
        });

        const restrictedZones = (args.restricted_zones || []).map(z => {
            return new ValetudoRestrictedZone({
                points: {
                    pA: {x: z.pA.x, y: z.pA.y},
                    pB: {x: z.pB.x, y: z.pB.y},
                    pC: {x: z.pC.x, y: z.pC.y},
                    pD: {x: z.pD.x, y: z.pD.y}
                },
                type: z.type || ValetudoRestrictedZone.TYPE.REGULAR
            });
        });

        const virtualRestrictions = new ValetudoVirtualRestrictions({
            virtualWalls: virtualWalls,
            restrictedZones: restrictedZones
        });

        await capability.setVirtualRestrictions(virtualRestrictions);

        return {content: [{type: "text", text: `Virtual restrictions updated: ${virtualWalls.length} wall(s), ${restrictedZones.length} restricted zone(s)`}]};
    }
}

module.exports = CombinedVirtualRestrictionsMcpTool;

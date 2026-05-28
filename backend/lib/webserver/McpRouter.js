const express = require("express");

class McpRouter {
    /**
     * @param {object} options
     * @param {import("../mcp/McpController")} options.mcpController
     * @param {import("../Configuration")} options.config
     * @param {*} options.validator
     */
    constructor(options) {
        this.router = express.Router({mergeParams: true});

        this.config = options.config;
        this.mcpController = options.mcpController;
        this.validator = options.validator;

        this.initRoutes();
    }

    initRoutes() {
        this.router.get("/status", (req, res) => {
            res.json(this.mcpController.getStatus());
        });

        this.router.get("/config", (req, res) => {
            res.json(this.config.get("mcp"));
        });

        this.router.put("/config", this.validator, (req, res) => {
            if (req.body && typeof req.body.enabled === "boolean") {
                this.config.set("mcp", req.body);
                res.json(this.config.get("mcp"));
            } else {
                res.sendStatus(400);
            }
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = McpRouter;

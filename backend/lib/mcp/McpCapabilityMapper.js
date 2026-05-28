const toolModuleCache = new Map();

function loadToolModule(name) {
    if (toolModuleCache.has(name)) {
        return toolModuleCache.get(name);
    }

    let mod;

    switch (name) {
        case "BasicControlMcpTool": mod = require("./tools/BasicControlMcpTool"); break;
        case "CombinedVirtualRestrictionsMcpTool": mod = require("./tools/CombinedVirtualRestrictionsMcpTool"); break;
        case "ConsumableMonitoringMcpTool": mod = require("./tools/ConsumableMonitoringMcpTool"); break;
        case "CurrentStatisticsMcpTool": mod = require("./tools/CurrentStatisticsMcpTool"); break;
        case "DoNotDisturbMcpTool": mod = require("./tools/DoNotDisturbMcpTool"); break;
        case "FanSpeedControlMcpTool": mod = require("./tools/FanSpeedControlMcpTool"); break;
        case "GoToLocationMcpTool": mod = require("./tools/GoToLocationMcpTool"); break;
        case "LocateMcpTool": mod = require("./tools/LocateMcpTool"); break;
        case "ManualControlMcpTool": mod = require("./tools/ManualControlMcpTool"); break;
        case "MappingPassMcpTool": mod = require("./tools/MappingPassMcpTool"); break;
        case "MapResetMcpTool": mod = require("./tools/MapResetMcpTool"); break;
        case "MapSegmentationMcpTool": mod = require("./tools/MapSegmentationMcpTool"); break;
        case "MapSegmentEditMcpTool": mod = require("./tools/MapSegmentEditMcpTool"); break;
        case "MapSegmentRenameMcpTool": mod = require("./tools/MapSegmentRenameMcpTool"); break;
        case "MapSnapshotMcpTool": mod = require("./tools/MapSnapshotMcpTool"); break;
        case "OperationModeControlMcpTool": mod = require("./tools/OperationModeControlMcpTool"); break;
        case "PendingMapChangeHandlingMcpTool": mod = require("./tools/PendingMapChangeHandlingMcpTool"); break;
        case "PresetSelectionMcpTool": mod = require("./tools/PresetSelectionMcpTool"); break;
        case "QuirksMcpTool": mod = require("./tools/QuirksMcpTool"); break;
        case "SimpleToggleMcpTool": mod = require("./tools/SimpleToggleMcpTool"); break;
        case "SpeakerTestMcpTool": mod = require("./tools/SpeakerTestMcpTool"); break;
        case "SpeakerVolumeControlMcpTool": mod = require("./tools/SpeakerVolumeControlMcpTool"); break;
        case "TotalStatisticsMcpTool": mod = require("./tools/TotalStatisticsMcpTool"); break;
        case "VoicePackManagementMcpTool": mod = require("./tools/VoicePackManagementMcpTool"); break;
        case "WaterUsageControlMcpTool": mod = require("./tools/WaterUsageControlMcpTool"); break;
        case "WifiConfigurationMcpTool": mod = require("./tools/WifiConfigurationMcpTool"); break;
        case "WifiScanMcpTool": mod = require("./tools/WifiScanMcpTool"); break;
        case "ZoneCleaningMcpTool": mod = require("./tools/ZoneCleaningMcpTool"); break;
        default: return null;
    }

    toolModuleCache.set(name, mod);

    return mod;
}

const CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING = {
    "BasicControlCapability": "BasicControlMcpTool",
    "FanSpeedControlCapability": "FanSpeedControlMcpTool",
    "WaterUsageControlCapability": "WaterUsageControlMcpTool",
    "OperationModeControlCapability": "OperationModeControlMcpTool",
    "GoToLocationCapability": "GoToLocationMcpTool",
    "ZoneCleaningCapability": "ZoneCleaningMcpTool",
    "MapSegmentationCapability": "MapSegmentationMcpTool",
    "LocateCapability": "LocateMcpTool",
    "ManualControlCapability": "ManualControlMcpTool",
    "HighResolutionManualControlCapability": "ManualControlMcpTool",
    "CombinedVirtualRestrictionsCapability": "CombinedVirtualRestrictionsMcpTool",
    "ConsumableMonitoringCapability": "ConsumableMonitoringMcpTool",
    "CurrentStatisticsCapability": "CurrentStatisticsMcpTool",
    "TotalStatisticsCapability": "TotalStatisticsMcpTool",
    "CarpetModeControlCapability": "SimpleToggleMcpTool",
    "ObstacleAvoidanceControlCapability": "SimpleToggleMcpTool",
    "PetObstacleAvoidanceControlCapability": "SimpleToggleMcpTool",
    "KeyLockCapability": "SimpleToggleMcpTool",
    "CameraLightControlCapability": "SimpleToggleMcpTool",
    "MopExtensionControlCapability": "SimpleToggleMcpTool",
    "MopTwistControlCapability": "SimpleToggleMcpTool",
    "CollisionAvoidantNavigationControlCapability": "SimpleToggleMcpTool",
    "FloorMaterialDirectionAwareNavigationControlCapability": "SimpleToggleMcpTool",
    "PersistentMapControlCapability": "SimpleToggleMcpTool",
    "MopDockMopAutoDryingControlCapability": "SimpleToggleMcpTool",
    "ObstacleImagesCapability": "SimpleToggleMcpTool",
    "CarpetSensorModeControlCapability": "PresetSelectionMcpTool",
    "MapSegmentMaterialControlCapability": "PresetSelectionMcpTool",
    "MopExtensionFurnitureLegHandlingControlCapability": "PresetSelectionMcpTool",
    "CleanRouteControlCapability": "PresetSelectionMcpTool",
    "MapResetCapability": "MapResetMcpTool",
    "MappingPassCapability": "MappingPassMcpTool",
    "MapSnapshotCapability": "MapSnapshotMcpTool",
    "MapSegmentRenameCapability": "MapSegmentRenameMcpTool",
    "MapSegmentEditCapability": "MapSegmentEditMcpTool",
    "PendingMapChangeHandlingCapability": "PendingMapChangeHandlingMcpTool",
    "SpeakerVolumeControlCapability": "SpeakerVolumeControlMcpTool",
    "VoicePackManagementCapability": "VoicePackManagementMcpTool",
    "WifiConfigurationCapability": "WifiConfigurationMcpTool",
    "WifiScanCapability": "WifiScanMcpTool",
    "DoNotDisturbCapability": "DoNotDisturbMcpTool",
    "QuirksCapability": "QuirksMcpTool",
    "AutoEmptyDockManualTriggerCapability": "SimpleToggleMcpTool",
    "MopDockCleanManualTriggerCapability": "SimpleToggleMcpTool",
    "MopDockDryManualTriggerCapability": "SimpleToggleMcpTool",
    "MopDockMopDryingTimeControlCapability": "PresetSelectionMcpTool",
    "MopDockMopWashTemperatureControlCapability": "PresetSelectionMcpTool",
    "AutoEmptyDockAutoEmptyDurationControlCapability": "PresetSelectionMcpTool",
    "AutoEmptyDockAutoEmptyIntervalControlCapability": "PresetSelectionMcpTool",
    "SpeakerTestCapability": "SpeakerTestMcpTool"
};

const TOGGLE_CAPABILITY_NAMES = {
    "CarpetModeControlCapability": {name: "set_carpet_mode", desc: "Enable or disable carpet mode"},
    "ObstacleAvoidanceControlCapability": {name: "set_obstacle_avoidance", desc: "Enable or disable obstacle avoidance"},
    "PetObstacleAvoidanceControlCapability": {name: "set_pet_obstacle_avoidance", desc: "Enable or disable pet obstacle avoidance"},
    "KeyLockCapability": {name: "set_key_lock", desc: "Enable or disable the key lock"},
    "CameraLightControlCapability": {name: "set_camera_light", desc: "Enable or disable the camera light"},
    "MopExtensionControlCapability": {name: "set_mop_extension", desc: "Enable or disable the mop extension"},
    "MopTwistControlCapability": {name: "set_mop_twist", desc: "Enable or disable mop twist"},
    "CollisionAvoidantNavigationControlCapability": {name: "set_collision_avoidant_nav", desc: "Enable or disable collision-avoidant navigation"},
    "FloorMaterialDirectionAwareNavigationControlCapability": {name: "set_floor_aware_nav", desc: "Enable or disable floor-material-aware navigation"},
    "PersistentMapControlCapability": {name: "set_persistent_map", desc: "Enable or disable persistent map"},
    "MopDockMopAutoDryingControlCapability": {name: "set_mop_auto_drying", desc: "Enable or disable automatic mop drying"},
    "ObstacleImagesCapability": {name: "set_obstacle_images", desc: "Enable or disable obstacle images"},
    "AutoEmptyDockManualTriggerCapability": {name: "trigger_auto_empty", desc: "Trigger auto-empty dock"},
    "MopDockCleanManualTriggerCapability": {name: "trigger_mop_dock_clean", desc: "Trigger mop dock cleaning"},
    "MopDockDryManualTriggerCapability": {name: "trigger_mop_dock_dry", desc: "Trigger mop dock drying"}
};

const PRESET_CAPABILITY_NAMES = {
    "CarpetSensorModeControlCapability": {name: "set_carpet_sensor_mode", desc: "Select carpet sensor mode preset"},
    "MapSegmentMaterialControlCapability": {name: "set_segment_material", desc: "Select map segment material preset"},
    "MopExtensionFurnitureLegHandlingControlCapability": {name: "set_mop_furniture_handling", desc: "Select mop furniture leg handling mode"},
    "CleanRouteControlCapability": {name: "set_clean_route", desc: "Select clean route type"},
    "MopDockMopDryingTimeControlCapability": {name: "set_mop_drying_time", desc: "Set mop drying time preset"},
    "MopDockMopWashTemperatureControlCapability": {name: "set_mop_wash_temperature", desc: "Set mop wash temperature preset"},
    "AutoEmptyDockAutoEmptyDurationControlCapability": {name: "set_auto_empty_duration", desc: "Set auto-empty duration preset"},
    "AutoEmptyDockAutoEmptyIntervalControlCapability": {name: "set_auto_empty_interval", desc: "Set auto-empty interval preset"}
};

class McpCapabilityMapper {
    static getToolDefinition(capabilityType, capability) {
        const toolName = CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING[capabilityType];

        if (!toolName) {
            return null;
        }

        const toolClass = loadToolModule(toolName);

        if (!toolClass) {
            return null;
        }

        if (toolName === "SimpleToggleMcpTool") {
            const meta = TOGGLE_CAPABILITY_NAMES[capabilityType];
            if (!meta) {
                return null;
            }
            return toolClass.getDefinition(capabilityType, meta);
        }

        if (toolName === "PresetSelectionMcpTool") {
            const meta = PRESET_CAPABILITY_NAMES[capabilityType];
            if (!meta) {
                return null;
            }
            return toolClass.getDefinition(capabilityType, capability, meta);
        }

        if (toolName === "ManualControlMcpTool") {
            return toolClass.getDefinition(capabilityType, capability);
        }

        return toolClass.getDefinition(capability);
    }

    static async executeTool(capabilityType, capability, args) {
        const toolName = CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING[capabilityType];

        if (!toolName) {
            throw new Error(`No MCP tool mapping for capability type: ${capabilityType}`);
        }

        const toolClass = loadToolModule(toolName);

        if (!toolClass) {
            throw new Error(`Could not load MCP tool module: ${toolName}`);
        }

        if (toolName === "SimpleToggleMcpTool") {
            return toolClass.execute(capability, args);
        }

        if (toolName === "PresetSelectionMcpTool") {
            return toolClass.execute(capability, args);
        }

        if (toolName === "ManualControlMcpTool") {
            return toolClass.execute(capabilityType, capability, args);
        }

        return toolClass.execute(capability, args);
    }
}

module.exports = McpCapabilityMapper;

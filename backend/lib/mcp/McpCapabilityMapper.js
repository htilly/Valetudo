const BasicControlMcpTool = require("./tools/BasicControlMcpTool");
const CombinedVirtualRestrictionsMcpTool = require("./tools/CombinedVirtualRestrictionsMcpTool");
const ConsumableMonitoringMcpTool = require("./tools/ConsumableMonitoringMcpTool");
const CurrentStatisticsMcpTool = require("./tools/CurrentStatisticsMcpTool");
const DoNotDisturbMcpTool = require("./tools/DoNotDisturbMcpTool");
const FanSpeedControlMcpTool = require("./tools/FanSpeedControlMcpTool");
const GoToLocationMcpTool = require("./tools/GoToLocationMcpTool");
const LocateMcpTool = require("./tools/LocateMcpTool");
const ManualControlMcpTool = require("./tools/ManualControlMcpTool");
const MappingPassMcpTool = require("./tools/MappingPassMcpTool");
const MapResetMcpTool = require("./tools/MapResetMcpTool");
const MapSegmentationMcpTool = require("./tools/MapSegmentationMcpTool");
const MapSegmentEditMcpTool = require("./tools/MapSegmentEditMcpTool");
const MapSegmentRenameMcpTool = require("./tools/MapSegmentRenameMcpTool");
const MapSnapshotMcpTool = require("./tools/MapSnapshotMcpTool");
const OperationModeControlMcpTool = require("./tools/OperationModeControlMcpTool");
const PendingMapChangeHandlingMcpTool = require("./tools/PendingMapChangeHandlingMcpTool");
const PresetSelectionMcpTool = require("./tools/PresetSelectionMcpTool");
const QuirksMcpTool = require("./tools/QuirksMcpTool");
const SimpleToggleMcpTool = require("./tools/SimpleToggleMcpTool");
const SpeakerVolumeControlMcpTool = require("./tools/SpeakerVolumeControlMcpTool");
const TotalStatisticsMcpTool = require("./tools/TotalStatisticsMcpTool");
const VoicePackManagementMcpTool = require("./tools/VoicePackManagementMcpTool");
const WaterUsageControlMcpTool = require("./tools/WaterUsageControlMcpTool");
const WifiConfigurationMcpTool = require("./tools/WifiConfigurationMcpTool");
const WifiScanMcpTool = require("./tools/WifiScanMcpTool");
const ZoneCleaningMcpTool = require("./tools/ZoneCleaningMcpTool");

const CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING = {
    "BasicControlCapability": BasicControlMcpTool,
    "FanSpeedControlCapability": FanSpeedControlMcpTool,
    "WaterUsageControlCapability": WaterUsageControlMcpTool,
    "OperationModeControlCapability": OperationModeControlMcpTool,
    "GoToLocationCapability": GoToLocationMcpTool,
    "ZoneCleaningCapability": ZoneCleaningMcpTool,
    "MapSegmentationCapability": MapSegmentationMcpTool,
    "LocateCapability": LocateMcpTool,
    "ManualControlCapability": ManualControlMcpTool,
    "HighResolutionManualControlCapability": ManualControlMcpTool,
    "CombinedVirtualRestrictionsCapability": CombinedVirtualRestrictionsMcpTool,
    "ConsumableMonitoringCapability": ConsumableMonitoringMcpTool,
    "CurrentStatisticsCapability": CurrentStatisticsMcpTool,
    "TotalStatisticsCapability": TotalStatisticsMcpTool,
    "CarpetModeControlCapability": SimpleToggleMcpTool,
    "ObstacleAvoidanceControlCapability": SimpleToggleMcpTool,
    "PetObstacleAvoidanceControlCapability": SimpleToggleMcpTool,
    "KeyLockCapability": SimpleToggleMcpTool,
    "CameraLightControlCapability": SimpleToggleMcpTool,
    "MopExtensionControlCapability": SimpleToggleMcpTool,
    "MopTwistControlCapability": SimpleToggleMcpTool,
    "CollisionAvoidantNavigationControlCapability": SimpleToggleMcpTool,
    "FloorMaterialDirectionAwareNavigationControlCapability": SimpleToggleMcpTool,
    "PersistentMapControlCapability": SimpleToggleMcpTool,
    "MopDockMopAutoDryingControlCapability": SimpleToggleMcpTool,
    "ObstacleImagesCapability": SimpleToggleMcpTool,
    "CarpetSensorModeControlCapability": PresetSelectionMcpTool,
    "MapSegmentMaterialControlCapability": PresetSelectionMcpTool,
    "MopExtensionFurnitureLegHandlingControlCapability": PresetSelectionMcpTool,
    "CleanRouteControlCapability": PresetSelectionMcpTool,
    "MapResetCapability": MapResetMcpTool,
    "MappingPassCapability": MappingPassMcpTool,
    "MapSnapshotCapability": MapSnapshotMcpTool,
    "MapSegmentRenameCapability": MapSegmentRenameMcpTool,
    "MapSegmentEditCapability": MapSegmentEditMcpTool,
    "PendingMapChangeHandlingCapability": PendingMapChangeHandlingMcpTool,
    "SpeakerVolumeControlCapability": SpeakerVolumeControlMcpTool,
    "VoicePackManagementCapability": VoicePackManagementMcpTool,
    "WifiConfigurationCapability": WifiConfigurationMcpTool,
    "WifiScanCapability": WifiScanMcpTool,
    "DoNotDisturbCapability": DoNotDisturbMcpTool,
    "QuirksCapability": QuirksMcpTool,
    "AutoEmptyDockManualTriggerCapability": SimpleToggleMcpTool,
    "MopDockCleanManualTriggerCapability": SimpleToggleMcpTool,
    "MopDockDryManualTriggerCapability": SimpleToggleMcpTool
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
    /**
     * @param {string} capabilityType
     * @param {import("../core/capabilities/Capability")} capability
     * @returns {object|null}
     */
    static getToolDefinition(capabilityType, capability) {
        const toolClass = CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING[capabilityType];

        if (!toolClass) {
            return null;
        }

        if (toolClass === SimpleToggleMcpTool) {
            const meta = TOGGLE_CAPABILITY_NAMES[capabilityType];
            if (!meta) {
                return null;
            }
            return SimpleToggleMcpTool.getDefinition(capabilityType, meta);
        }

        if (toolClass === PresetSelectionMcpTool) {
            const meta = PRESET_CAPABILITY_NAMES[capabilityType];
            if (!meta) {
                return null;
            }
            return PresetSelectionMcpTool.getDefinition(capabilityType, capability, meta);
        }

        if (toolClass === ManualControlMcpTool) {
            return ManualControlMcpTool.getDefinition(capabilityType, capability);
        }

        return toolClass.getDefinition(capability);
    }

    /**
     * @param {string} capabilityType
     * @param {import("../core/capabilities/Capability")} capability
     * @param {object} args
     * @returns {Promise<object>}
     */
    static async executeTool(capabilityType, capability, args) {
        const toolClass = CAPABILITY_TYPE_TO_MCP_TOOL_MAPPING[capabilityType];

        if (!toolClass) {
            throw new Error(`No MCP tool mapping for capability type: ${capabilityType}`);
        }

        if (toolClass === SimpleToggleMcpTool) {
            return SimpleToggleMcpTool.execute(capability, args);
        }

        if (toolClass === PresetSelectionMcpTool) {
            return PresetSelectionMcpTool.execute(capability, args);
        }

        if (toolClass === ManualControlMcpTool) {
            return ManualControlMcpTool.execute(capabilityType, capability, args);
        }

        return toolClass.execute(capability, args);
    }
}

module.exports = McpCapabilityMapper;

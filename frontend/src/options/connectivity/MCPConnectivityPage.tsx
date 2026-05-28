import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Grid2,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import {
    useMCPConfigurationMutation,
    useMCPConfigurationQuery
} from "../../api";
import InfoBox from "../../components/InfoBox";
import PaperContainer from "../../components/PaperContainer";
import {MCPIcon} from "../../components/CustomIcons";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";

const MCPConnectivitySettings = (): React.ReactElement => {
    const {
        data: storedConfiguration,
        isPending: configurationPending,
        isError: configurationError,
    } = useMCPConfigurationQuery();

    const {
        mutate: updateConfiguration,
        isPending: configurationUpdating
    } = useMCPConfigurationMutation();

    const [enabled, setEnabled] = React.useState(false);
    const [endpoint, setEndpoint] = React.useState("/mcp");

    const [configurationModified, setConfigurationModified] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (storedConfiguration) {
            setEnabled(storedConfiguration.enabled);
            setEndpoint(storedConfiguration.endpoint);
        }
    }, [storedConfiguration]);

    if (configurationPending) {
        return (
            <Skeleton height={"8rem"}/>
        );
    }

    if (configurationError || !storedConfiguration) {
        return <Typography color="error">Error loading MCP configuration</Typography>;
    }

    return (
        <>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={enabled}
                        onChange={e => {
                            setEnabled(e.target.checked);
                            setConfigurationModified(true);
                        }}
                    />
                }
                label="MCP enabled"
                sx={{mb: 1, marginTop: "1rem", userSelect: "none"}}
            />
            <Grid2 container spacing={1} sx={{mb: 1, mt: "1rem"}} direction="row">
                <Grid2 style={{flexGrow: 1}}>
                    <TextField
                        style={{width: "100%"}}
                        label="Endpoint"
                        value={endpoint}
                        variant="standard"
                        onChange={e => {
                            setEndpoint(e.target.value);
                            setConfigurationModified(true);
                        }}
                    />
                </Grid2>
            </Grid2>

            <InfoBox
                boxShadow={5}
                style={{
                    marginTop: "3rem",
                    marginBottom: "2rem"
                }}
            >
                <Typography color="info">
                    The Model Context Protocol (MCP) allows AI clients such as Claude, ChatGPT, or any
                    MCP-compatible application to directly control your robot. When enabled, the MCP endpoint
                    is accessible on the same port as the Valetudo web interface, protected by the same
                    authentication.
                    <br/><br/>
                    MCP is a standardized protocol that exposes the robot&apos;s capabilities as tools that AI
                    clients can invoke. This includes starting/stopping cleaning, changing fan speed, going
                    to locations, and more. The robot&apos;s state and map are also exposed as resources.
                    <br/><br/>
                    Since this service runs on an embedded device with limited resources, the MCP
                    implementation uses a stateless design with no persistent session state. Each request
                    is handled independently.
                </Typography>
            </InfoBox>

            <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>
            <Grid2 container>
                <Grid2 style={{marginLeft: "auto"}}>
                    <Button
                        loading={configurationUpdating}
                        color="primary"
                        variant="outlined"
                        disabled={!configurationModified}
                        onClick={() => {
                            updateConfiguration({
                                enabled: enabled,
                                endpoint: endpoint
                            });
                            setConfigurationModified(false);
                        }}
                    >
                        Save configuration
                    </Button>
                </Grid2>
            </Grid2>
        </>
    );
};

const MCPConnectivityPage = (): React.ReactElement => {
    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title="MCP Connectivity"
                        icon={<MCPIcon/>}
                    />

                    <MCPConnectivitySettings/>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default MCPConnectivityPage;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
    Typography,
    createTheme,
    ThemeProvider,
    Card,
    Box,
    Button,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { NetworkData, networkDataList, NetworkId } from "./NetworkData";
import { saveNetworks, setDefaultNetworkId } from "./background";
import ConfirmationDialog from "./ConfirmationDialog";
import NetworkSelect from "./NetworkSelect";
import { NetworkFormTab } from "./NetworkFormTab";
import { SelectChangeEvent } from "@mui/material/Select";
import {createRoot} from "react-dom/client";
import {goHome} from "./GoTo";

const theme = createTheme({
    palette: {
        primary: {
            main: blue[500],
        },
    },
});

const getDefaultNetwork = (): NetworkData => ({
    name: "",
    gasPrice: 0,
    chainId: 0,
    rpcUrl: "",
});

const RpcSettings = () => {
    const [networks, setNetworks] = useState<NetworkData[]>(() => {
        const savedNetworks = localStorage.getItem("networks");
        return savedNetworks ? JSON.parse(savedNetworks) : networkDataList;
    });
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkData>(
        getDefaultNetwork()
    );
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [deleteNetworkId, setDeleteNetworkId] = useState<number>(0);
    useEffect(() => {
        chrome.storage.sync.get(
            {
                selectedNetwork: NetworkId.ETH_MAIN,
            },
            (items) => {
                console.log("items", items)
                setSelectedNetwork(
                    networks.find(
                        (network) => network.chainId === items.selectedNetwork
                    ) || getDefaultNetwork()
                );
            }
        );
    }, []);

    const handleAddNetwork = (newNetwork: NetworkData) => {
        const maxChainId = Math.max(
            ...networks.map((network) => network.chainId)
        );
        setNetworks([...networks, newNetwork]);
        setSelectedNetwork(newNetwork);
    };

    const handleSaveNetwork = (updatedNetwork: NetworkData) => {
        const updatedNetworks = networks.map((network) =>
            network.chainId === updatedNetwork.chainId ? updatedNetwork : network
        );
        console.log("updatedNetwork对对对", updatedNetwork)
        setSelectedNetwork(updatedNetwork);
        setNetworks(updatedNetworks);
        saveNetworks(updatedNetworks);
        setDefaultNetworkId(updatedNetwork.chainId);
    };

    const handleNetworkChange = (event: SelectChangeEvent<number>) => {
        const selectedNetworkId = event.target.value;
        setSelectedNetwork(
            networks.find((network) => network.chainId === selectedNetworkId) ||
            getDefaultNetwork()
        );
        chrome.storage.sync.set({ selectedNetwork: selectedNetworkId });
    };

    const handleDeleteNetwork = (chainId: number) => {
        setDeleteNetworkId(chainId);
        setConfirmDelete(true);
    };

    const confirmedDelete = (confirmed: boolean) => {
        if (confirmed) {
            const updatedNetworks = networks.filter(
                (network) => network.chainId !== deleteNetworkId
            );

            if (selectedNetwork.chainId === deleteNetworkId) {
                const selectedNetwork = updatedNetworks.find(
                    (network) => network.chainId === 1
                ) || getDefaultNetwork();
                setSelectedNetwork(selectedNetwork);
                chrome.storage.sync.set({ selectedNetwork: selectedNetwork.chainId });
            }

            setNetworks(updatedNetworks);
            saveNetworks(updatedNetworks);
            setConfirmDelete(false);
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                width="100%"
                height="100%"
                style={{
                    maxWidth: "800px",
                    margin: "auto",
                }}
            >
                <Card
                    elevation={5}
                    sx={{
                        p: 2,
                        borderRadius: "16px",
                        width: "100%",
                        backgroundColor: "#fff",
                        px: 5,
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            onClick={goHome}
                            style={{
                                cursor: "pointer",
                            }}
                        >
                            <img
                                src={`imgs/logo/logo192.png`}
                                alt="Logo"
                                style={{
                                    maxWidth: "40px",
                                    maxHeight: "40px",
                                    marginRight: "8px",
                                }}
                            />
                            <Typography variant="h6" sx={{ fontSize: "16px" }}>
                                Gas Show
                            </Typography>
                        </Box>

                        <NetworkSelect
                            networks={networks}
                            selectedNetwork={selectedNetwork.chainId}
                            handleNetworkChange={handleNetworkChange}
                        />
                    </Box>
                </Card>
                <Card
                    elevation={5}
                    sx={{
                        width: "100%",
                        p: 2,
                        borderRadius: "16px",
                        mt: 2,
                    }}
                >
                    <NetworkFormTab
                        networks={networks}
                        selectedNetworkData={selectedNetwork}
                        handleAddNetwork={handleAddNetwork}
                        handleSaveNetwork={handleSaveNetwork}
                        handleDeleteNetwork={handleDeleteNetwork}
                    />
                </Card>
            </Box>
            <ConfirmationDialog
                open={confirmDelete}
                title="Delete Network"
                message="Are you sure you want to delete this network?"
                onClose={() => setConfirmDelete(false)}
                onConfirm={confirmedDelete}
            />
        </ThemeProvider>
    );
};


const root = createRoot(document.getElementById("root")!);

root.render(
    <ThemeProvider theme={theme}>
        <RpcSettings />
    </ThemeProvider>,
);

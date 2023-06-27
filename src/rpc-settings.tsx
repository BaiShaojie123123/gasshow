import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    createTheme,
    ThemeProvider,
    Typography,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import {
    NetworkData,
    networkDataList,
    NetworkId,

} from "./NetworkData";
import {
    getSavedNetworks,
    saveNetworks,
    setDefaultNetworkId,
} from "./background";
import ConfirmationDialog from "./ConfirmationDialog";
import NetworkSelect from "./NetworkSelect";
import { NetworkFormTab } from "./NetworkFormTab";
import { SelectChangeEvent } from "@mui/material/Select";
import { createRoot } from "react-dom/client";
import { goHome } from "./GoTo";
import {getDefaultNetworkData} from "./interface";

const theme = createTheme({
    palette: {
        primary: {
            main: blue[500],
        },
    },
});

const RpcSettings = () => {
    const [networks, setNetworks] = useState<NetworkData[]>([]);
    const [selectedNetworkData, setSelectedNetworkData] =
        useState<NetworkData>(getDefaultNetworkData());
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
    const [deleteNetworkId, setDeleteNetworkId] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const savedNetworks = await getSavedNetworks();
                setNetworks(savedNetworks || networkDataList);
                const items = await new Promise<{ selectedNetworkId: number }>((resolve) => {
                    chrome.storage.sync.get(
                        {
                            selectedNetworkId: NetworkId.ETH_MAIN,
                        },
                        (result) => {
                            resolve(result as { selectedNetworkId: number });
                        }
                    );
                });

                const selectedNetwork = savedNetworks?.find(
                    (network) => network.chainId === items.selectedNetworkId
                );
                setSelectedNetworkData(selectedNetwork || getDefaultNetworkData());
            } catch (error) {
                // 处理错误
                console.error(error);
            }
        };

        fetchData();
    }, []);



    const handleAddNetwork = (newNetwork: NetworkData) => {
        const updatedNetworks = [...networks, newNetwork];
        setNetworks(updatedNetworks);
        saveNetworks(updatedNetworks);
        setSelectedNetworkData(newNetwork);
        setDefaultNetworkId(newNetwork.chainId);
    };


    const handleSaveNetwork = async (updatedNetwork: NetworkData) => {
        const updatedNetworks = networks.map((network) =>
            network.chainId === updatedNetwork.chainId ? updatedNetwork : network
        );
        setSelectedNetworkData(updatedNetwork);
        setNetworks(updatedNetworks);
        saveNetworks(updatedNetworks);
        await setDefaultNetworkId(updatedNetwork.chainId);
    };

    const handleNetworkChange = (event: SelectChangeEvent<number>) => {
        const selectedNetworkId = event.target.value;
        const selectedNetwork = networks.find(
            (network) => network.chainId === selectedNetworkId
        );
        setSelectedNetworkData(selectedNetwork || getDefaultNetworkData());
        chrome.storage.sync.set({ selectedNetworkId });
    };

    const handleDeleteNetwork = (chainId: number) => {
        setDeleteNetworkId(chainId);
        setConfirmDelete(true);
    };

    const confirmedDelete = async (confirmed: boolean) => {
        if (confirmed) {
            const updatedNetworks = networks.filter(
                (network) => network.chainId !== deleteNetworkId
            );

            if (selectedNetworkData.chainId === deleteNetworkId) {
                const selectedNetwork =
                    updatedNetworks.find((network) => network.chainId === 1) ||
                    getDefaultNetworkData();
                setSelectedNetworkData(selectedNetwork);
                chrome.storage.sync.set({ selectedNetworkId: selectedNetwork.chainId });
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
                    maxWidth: "600px",
                    minWidth: "600px",
                    margin: "auto",
                    padding: "2%",
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: "16px",
                        width: "100%",
                        backgroundColor: "#fff",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
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
                            selectedNetwork={selectedNetworkData.chainId}
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
                        selectedNetworkData={selectedNetworkData}
                        handleAddNetwork={handleAddNetwork}
                        handleSaveNetwork={handleSaveNetwork}
                        handleDeleteNetwork={handleDeleteNetwork}
                    />
                </Card>
            </Box>
            <ConfirmationDialog
                open={confirmDelete}
                title="删除网络"
                message="确认要删除网络吗?"
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
    </ThemeProvider>
);

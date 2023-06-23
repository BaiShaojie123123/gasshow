import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Box, Grid, Typography, Button, Card } from "@mui/material";
import { NetworkData, networkDataList, NetworkId } from "./NetworkData";
import { formatPrice, getGasPrice, getSavedNetworks } from "./background";
import { goHome } from "./GoTo";

interface NetworkProps {
    name: string;
    gasPrice?: number | undefined;
    isSelected: boolean;
    onClick: () => void;
}

const Network: React.FC<NetworkProps> = ({ name, gasPrice, isSelected, onClick }) => {
    return (
        <Box
            borderRadius="8px"
            onClick={onClick}
            p={2}
            sx={{
                width: 150,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? "#00BFFF" : "rgba(0, 0, 0, 0.1)",
                color: "black",
            }}
        >
            <Typography variant="body2" sx={{ fontSize: "14px" }}>
                {name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "14px" }}>
                {gasPrice} Gwei
            </Typography>
        </Box>
    );
};

const Popup: React.FC = () => {
    const [selectedNetworkId, setSelectedNetworkId] = useState<number>(NetworkId.ETH_MAIN);
    const [networks, setNetworks] = useState<NetworkData[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const savedNetworks = await getSavedNetworks(true);

            const updatedNetworks: NetworkData[] = [];

            await Promise.all(
                savedNetworks.map(async (network) => {
                    const gasPrice = await getGasPrice(network.chainId, network.rpcUrl);
                    updatedNetworks.push({ ...network, gasPrice });
                })
            );

            // 对 updatedNetworks 数组按照 chainId 进行升序排序
            updatedNetworks.sort((a, b) => a.chainId - b.chainId);

            setNetworks(updatedNetworks); // 在所有getGasPrice请求完成后再更新状态
        };


        chrome.storage.sync.get(
            {
                networks: networkDataList,
                selectedNetworkId: NetworkId.ETH_MAIN,
            },
            (items) => {
                console.log(items.selectedNetworkId)
                setSelectedNetworkId(items.selectedNetworkId);
            }
        );

        loadData();
    }, []);

    useEffect(() => {
        const handleBadgeUpdate = (networkId: number) => {
            const selectedNetworkData = networks.find((network) => network.chainId === networkId);
            if (selectedNetworkData && selectedNetworkData.gasPrice !== undefined) {
                const gasPrice = selectedNetworkData.gasPrice;
                chrome.action.setBadgeText({ text: formatPrice(gasPrice) });
            }
        };

        if (networks.every((network) => network.gasPrice !== undefined)) {
            handleBadgeUpdate(selectedNetworkId);
        }
    }, [networks, selectedNetworkId]);

    const handleNetworkClick = (networkId: number) => {
        setSelectedNetworkId(networkId);
        chrome.storage.sync.set({ selectedNetworkId: networkId });
        handleBadgeUpdate(networkId);
    };

    const handleBadgeUpdate = (networkId: number) => {
        const selectedNetworkData = networks.find((network) => network.chainId === networkId);
        if (selectedNetworkData) {
            const gasPrice = selectedNetworkData.gasPrice;
            const badgeText = formatPrice(gasPrice);
            chrome.action.setBadgeText({ text: badgeText });
        }
    };


    const handleSettingsClick = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("rpc-settings.html") });
    };


    return (
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
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: "16px",
                    width: "100%",
                    backgroundColor: "#fff",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    px:5
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center"
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
                    <Button variant="outlined" onClick={handleSettingsClick}
                            style={{
                                fontSize: "14px",
                            }}
                    >
                        设置
                    </Button>
                </Box>
            </Card>
            <Card
                variant="outlined"
                sx={{
                    width: "100%",
                    p: 2,
                    borderRadius: "16px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                    mt: 2,
                    overflowX: "auto",
                }}
            >
                <Grid container spacing={2} justifyContent="space-evenly" sx={{ flexWrap: "wrap" }}>
                    {networks.map((network) => (
                        <Grid item key={network.chainId}>
                            <Box key={network.chainId} my={1}>
                                <Network
                                    name={network.name}
                                    gasPrice={network.gasPrice}
                                    isSelected={selectedNetworkId === network.chainId}
                                    onClick={() => handleNetworkClick(network.chainId)}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Card>
        </Box>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

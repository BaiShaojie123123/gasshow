import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { Box, Grid } from "@mui/material";
import {NetworkData, networkDataList, NetworkId} from "./NetworkData";
import { Avatar, Typography } from "@mui/material";
import {format_price} from "./background";

interface NetworkProps {
    name: string;
    gasPrice: number;
    isSelected: boolean;
    onClick: () => void;
}

const Network: React.FC<NetworkProps> = ({
                                             name,
                                             gasPrice,
                                             isSelected,
                                             onClick,
                                         }) => {
    return (
        <Box
            borderRadius="8px"
            onClick={onClick}
            p={2}
            sx={{
                width: 150,
                // height: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected
                    ? "#00BFFF"
                    : "rgba(0, 0, 0, 0.1)",
                color: isSelected ? "black" : "black",
            }}
        >
            <Typography variant="body2" sx={{ fontSize: "14px" }} >{name}</Typography>
            <Typography variant="body2" sx={{ fontSize: "14px" }} >{gasPrice} Gwei</Typography>
        </Box>
    );
};

const Popup: React.FC = () => {
    const [selectedNetwork, setSelectedNetwork] = useState<number>(
        NetworkId.ETH_MAIN
    );
    const [networks, setNetworks] = useState<NetworkData[]>(networkDataList);

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "networkDataList") {
            console.log("Received networkDataList:", );
            setNetworks(message.data);
            // 在这里处理 networkDataList 更新的逻辑
        }
    });


    useEffect(() => {
        chrome.storage.sync.get(
            {
                networkDataList: networkDataList,
                selectedNetwork: NetworkId.ETH_MAIN,
            },
            (items) => {
                setNetworks(items.networkDataList);
                setSelectedNetwork(items.selectedNetwork);

            }
        );

    }, []);
    const handleBadgeUpdate = useCallback((networkId: number) => {
        chrome.storage.sync.get(['networkDataList'], (result) => {
            const networkDataList = result.networkDataList;
            if (networkDataList) {
                const selectedNetworkData = networkDataList.find((networkData: { chainId: number; }) => networkData.chainId === networkId);
                if (selectedNetworkData) {
                    const gasPrice = selectedNetworkData.gasPrice;
                    chrome.action.setBadgeText({ text: format_price(gasPrice) }); // 更新徽章文本为当前 gas price 值
                }
            }
        });
    }, []);

    const handleNetworkClick = useCallback((networkId: number) => {
        setSelectedNetwork(networkId);
        chrome.storage.sync.set({selectedNetwork: networkId})
// 获取选择的网络的 gas price 值

        // 更新徽章文本为当前选择的网络的 gas price 值
        handleBadgeUpdate(networkId);
    }, [handleBadgeUpdate]);


    const memoizedNetworks = useMemo(() => {
        return networks.map((network) => (
            <Box key={network.chainId}  my={1}>
                <Network
                    name={network.name}
                    gasPrice={network.gasPrice}
                    isSelected={selectedNetwork === network.chainId}
                    onClick={() => handleNetworkClick(network.chainId)}
                />
            </Box>
        ));
    }, [networks, selectedNetwork, handleNetworkClick]);

    return (
        <Box display="flex"
             flexDirection="column"
             alignItems="center"
             width="100%"
             style={{ height: "100%" }}>
            <Grid container >
            {memoizedNetworks.map((network, index) => (
                <Grid item xs={4} key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {network}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

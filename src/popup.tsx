import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Box, Button, Card, Grid, Typography} from "@mui/material";
import {NetworkData, networkDataList, NetworkId} from "./NetworkData";
import {getGasPrice, getSavedNetworks, setBadgeText} from "./background";
import {goHome, goSetting} from "./GoTo";


interface NetworkProps {
    network: NetworkData;
    isSelected: boolean;
    onClick: () => void;
}

const Network: React.FC<NetworkProps> = ({network, isSelected, onClick}) => {
    const [gasPrice, setGasPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        const fetchGasPrice = async () => {
            const price = await getGasPrice(network.chainId, network.rpcUrl);
            setGasPrice(price);
        };
        fetchGasPrice();
    }, [network]);

    let displayPrice = "获取中...";
    if (gasPrice !== undefined) {
        displayPrice = gasPrice < 0.0001 ? '小于0.0001 Gwei' : `${gasPrice} Gwei`;
    }
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
            <Typography variant="body2" sx={{fontSize: "14px"}}>
                {network.name}
            </Typography>
            <Typography variant="body2" sx={{fontSize: "14px"}}>
                {displayPrice}
            </Typography>
        </Box>
    );
};

const Popup: React.FC = () => {
    const [selectedNetworkId, setSelectedNetworkId] = useState<number>(NetworkId.ETH_MAIN);
    const [networks, setNetworks] = useState<NetworkData[]>([]);


    useEffect(() => {
        const loadData = async () => {
            const savedNetworks = await getSavedNetworks();

            // // 创建一个 Promise 数组来并行获取每个网络的 gasPrice
            // const gasPricePromises = savedNetworks.map((network) =>
            //     getGasPrice(network.chainId, network.rpcUrl)
            // );
            //
            // // 使用 Promise.all 等待所有 gasPrice 请求完成
            // const gasPrices = await Promise.all(gasPricePromises);

            // 将每个网络的 gasPrice 合并到对应的网络对象中
            const updatedNetworks = savedNetworks.map((network, index) => ({
                ...network
            }));

            // 对 updatedNetworks 数组按照 chainId 进行升序排序
            updatedNetworks.sort((a, b) => a.chainId - b.chainId);

            setNetworks(updatedNetworks); // 在所有 getGasPrice 请求完成后再更新状态
        };

        chrome.storage.sync.get(
            {
                networks: networkDataList,
                selectedNetworkId: NetworkId.ETH_MAIN,
            },
            (items) => {
                setSelectedNetworkId(items.selectedNetworkId);
            }
        );

        loadData();

        // 设置定时器，每5秒加载一次数据
        const timer = setInterval(loadData, 5000);

        // 返回一个清理函数，在组件卸载时清除定时器
        return () => {
            clearInterval(timer);
        };
    }, []);


    // useEffect(() => {
    //     // const handleBadgeUpdate = (networkId: number) => {
    //     //     const selectedNetworkData = networks.find((network) => network.chainId === networkId);
    //     //     if (selectedNetworkData && selectedNetworkData.gasPrice !== undefined) {
    //     //         setBadgeText(selectedNetworkData.gasPrice);
    //     //     }
    //     // };
    //     if (networks.every((network) => network.gasPrice !== undefined)) {
    //         handleBadgeUpdate(selectedNetworkId);
    //     }
    // }, [networks, selectedNetworkId]);

    const handleNetworkClick = (networkId: number) => {
        setSelectedNetworkId(networkId);
        chrome.storage.sync.set({selectedNetworkId: networkId});
        handleBadgeUpdate(networkId);
    };

    const handleBadgeUpdate = (networkId: number) => {
        const selectedNetworkData = networks.find((network) => network.chainId === networkId);
        if (selectedNetworkData) {
            setBadgeText(selectedNetworkData.gasPrice)
        }
    };


    const handleSettingsClick = () => {
        goSetting();
    };


    return (
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
                        <Typography variant="h6" sx={{fontSize: "16px"}}>
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
                <Grid container spacing={2} justifyContent="space-evenly" sx={{flexWrap: "wrap"}}>
                    {networks.map((network) => (
                        <Grid item key={network.chainId}>
                            <Box key={network.chainId} my={1}>
                                <Network
                                    network={network}
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
        <Popup/>
    </React.StrictMode>
);

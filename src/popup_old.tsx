//打开popup页面执行
import React, {useCallback, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {NetworkData, networkDataList, NetworkId} from './NetworkData';
import {Box, IconButton} from "@mui/material";

const Popup = () => {
    const [count, setCount] = useState(0);
    const [currentURL, setCurrentURL] = useState<string>();
    const [selectedNetwork, setSelectedNetwork] = useState<number>(NetworkId.ETH_MAIN);
    const [networks, setNetworks] = useState<NetworkData[]>(networkDataList);

    //设置图标上的文本内容 每次count 变更更新
    useEffect(() => {
        chrome.action.setBadgeText({text: count.toString()});
    }, [count]);
    useEffect(() => {
        // Restores select box and checkbox state using the preferences
        // stored in chrome.storage.
        //  使用存储在 chrome.storage 中的首选项恢复选择框和复选框状态。
        chrome.storage.sync.get(
            {'networkDataList': networkDataList},
            // {
            //     favoriteColor: "red",
            //     likesColor: true,
            // },
            (items) => {
                setNetworks(items.networkDataList);
                // setLike(items.likesColor);
            }
        );
    }, []);


    const handleNetworkClick = useCallback((networkId: number) => {
        setSelectedNetwork(networkId);
    }, []);
    useEffect(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            setCurrentURL(tabs[0].url);
        });
        //  这里是空数组,只在页面第一次加载时
    }, []);
    //  通知content
    const changeBackground = () => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const tab = tabs[0];
            if (tab.id) {
                //  向内容脚本发送消息  content scripts
                chrome.tabs.sendMessage(
                    tab.id,
                    {
                        color: "#555555",
                    },
                    (msg) => {
                        console.log("result message:", msg);
                    }
                );
            }
        });
    };

    return (
        <>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Box display="flex" flexWrap="wrap" justifyContent="center">
                    {networks.map((network) => (
                        <Box key={network.chainId} mx={2} my={1}>
                            <Box
                                onClick={()=>handleNetworkClick(network.chainId)}
                                p={1}
                                borderRadius={1}
                                bgcolor={selectedNetwork === network.chainId ? "primary.main" : "background.paper"}
                            >
                                {network.name} ({network.gasPrice} Gwei)
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);

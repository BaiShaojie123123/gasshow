import React from 'react';
import {Tab, Tabs, Box} from "@mui/material";
import {NetworkData} from "./NetworkData";
import {AddNetworkForm} from "./AddNetworkForm";
import {EditNetworkForm} from "./EditNetworkForm";

interface NetworkFormTabProps {
    networks: NetworkData[];
    selectedNetworkData: NetworkData;
    handleAddNetwork: (newNetwork: NetworkData) => void;
    handleSaveNetwork: (updatedNetwork: NetworkData) => void;
    handleDeleteNetwork: (chainId: number) => void;
}

export const NetworkFormTab: React.FC<NetworkFormTabProps> = ({
                                                                  networks,
                                                                  selectedNetworkData,
                                                                  handleAddNetwork,
                                                                  handleSaveNetwork,
                                                                  handleDeleteNetwork,
                                                              }) => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label="修改网络" />
                <Tab label="添加网络"/>
            </Tabs>
            {selectedTab === 0 && (
                <EditNetworkForm
                    networks={networks}
                    selectedNetworkData={selectedNetworkData}
                    handleSaveNetwork={handleSaveNetwork}
                    handleDeleteNetwork={handleDeleteNetwork}
                />
            )}
            {selectedTab === 1 && (
                <AddNetworkForm handleAddNetwork={handleAddNetwork}
                                networks={networks}
                />
            )}
        </>
    );
};

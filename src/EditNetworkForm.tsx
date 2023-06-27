import React, {useEffect, useState} from 'react';
import { Button, TextField, Box, Grid, Typography } from "@mui/material";
import {NetworkData, networkDataList, NetworkId} from "./NetworkData";
import WaitDialog from './WaitDialog';
import {getGasPrice, checkNetworkIdExists} from './background';
import {getDefaultNetworkData} from "./interface";

interface EditNetworkFormProps {
    networks: NetworkData[];
    selectedNetworkData: NetworkData;
    handleSaveNetwork: (updatedNetwork: NetworkData) => void;
    handleDeleteNetwork: (chainId: number) => void;
}

const getDefaultNetwork = (): NetworkData => ({
    name: "Default Network",
    gasPrice: 0,
    chainId: 1,
    rpcUrl: "https://example.com",
});
export const EditNetworkForm: React.FC<EditNetworkFormProps> = ({
                                                                    networks,
                                                                    selectedNetworkData,
                                                                    handleSaveNetwork,
                                                                    handleDeleteNetwork,
                                                                }) => {
    const [selectedNetworkInfo, setSelectedNetworkInfo] = useState<NetworkData>(
        selectedNetworkData || getDefaultNetwork()
    );

    const [showWaitDialog, setShowWaitDialog] = useState(false);
    const [waitDialogLoadingState, setWaitDialogLoadingState] = useState<"loading" | "success" | "failure">("loading");
    const [waitDialogMessage, setWaitDialogMessage] = useState('');

    useEffect(() => {
        setSelectedNetworkInfo(selectedNetworkData);
    }, [selectedNetworkData]);

    const handleNetworkInfoChange = (field: keyof NetworkData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (selectedNetworkData) {
            setSelectedNetworkInfo((prevNetworkInfo) => ({
                ...prevNetworkInfo,
                [field]: event.target.value,
            }));
        }
    };

    const handleNetworkClick = (chainId: number) => {
        setSelectedNetworkInfo(getNetworkInfo(chainId));
    };

    const getNetworkInfo = (chainId: number): NetworkData => {
        const networkData = networks.find((network) => network.chainId === chainId);
        return networkData || getDefaultNetworkData();
    };

    const handleSave = async () => {
        setShowWaitDialog(true);



        try {
            const gasPrice = await getGasPrice(selectedNetworkInfo.chainId, selectedNetworkInfo.rpcUrl);

            if (gasPrice !== 0) {
                setWaitDialogLoadingState("success");
                setWaitDialogMessage('保存成功');
                handleSaveNetwork(selectedNetworkInfo);
            } else {
                setWaitDialogLoadingState("failure");
                setWaitDialogMessage('连接网络失败');
            }
        } catch (error) {
            setWaitDialogLoadingState("failure");
            setWaitDialogMessage('连接网络失败');
        }
    };

    const handleDelete = () => {
        handleDeleteNetwork(selectedNetworkInfo.chainId);
    };

    const handleWaitDialogClose = () => {
        setShowWaitDialog(false);
    };

    return (
        <Grid
            container
            spacing={2}
            justifyContent="space-evenly"
            sx={{ flexWrap: "wrap" }}
        >
            <Grid item xs={12} sm={6}>
                {networks.map((network) => (
                    <Typography
                        key={network.chainId}
                        variant="subtitle1"
                        component="div"
                        className={`network-name ${network.chainId === selectedNetworkInfo.chainId ? "selected" : ""}`}
                        onClick={() => handleNetworkClick(network.chainId)}
                        sx={{
                            borderRadius: "16px",
                            m: "5%",
                            px: "5%",
                            cursor: "pointer",
                            textAlign: "right",
                            "&.selected": {
                                background: "#e3e3e3",
                                fontWeight: "bold",
                            },
                        }}
                    >
                        {network.name}
                    </Typography>
                ))}
            </Grid>
            <Grid item xs={12} sm={6}>
                {selectedNetworkInfo && (
                    <div>
                        <TextField
                            label="Name"
                            value={selectedNetworkInfo.name}
                            fullWidth
                            sx={{ mb: 1 }}
                            onChange={handleNetworkInfoChange("name")}
                        />
                        <TextField
                            label="Chain ID"
                            value={selectedNetworkInfo.chainId.toString()}
                            fullWidth
                            sx={{ mb: 1 }}
                            onChange={handleNetworkInfoChange("chainId")}
                            inputProps={{ type: 'number', step: 1 }}
                        />
                        <TextField
                            label="RPC URL"
                            value={selectedNetworkInfo.rpcUrl}
                            fullWidth
                            sx={{ mb: 1 }}
                            onChange={handleNetworkInfoChange("rpcUrl")}
                        />
                        <Grid
                            container
                            spacing={2}
                            justifyContent="flex-end"
                            alignItems="center"
                            sx={{ mt: 2 }}
                        >
                            {selectedNetworkInfo.chainId !== 1 && (
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        删除
                                    </Button>
                                </Grid>
                            )}
                            <Grid item>
                                <Button variant="outlined" onClick={handleSave}>
                                    保存
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                )}
            </Grid>
            <WaitDialog
                open={showWaitDialog}
                onClose={handleWaitDialogClose}
                loadingState={waitDialogLoadingState}
                message={waitDialogMessage}
            />
        </Grid>
    );
};

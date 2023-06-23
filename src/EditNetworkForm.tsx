import React, { useState } from 'react';
import { Button, TextField, Box, Grid, Typography } from "@mui/material";
import { NetworkData } from "./NetworkData";
import WaitDialog from './WaitDialog';
import { getGasPrice } from './background';

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
    const [selectedIndex, setSelectedIndex] = useState<number>(
        networks.findIndex(network => network.chainId === selectedNetworkData?.chainId)
    );
    const [showWaitDialog, setShowWaitDialog] = useState(false);
    const [waitDialogSuccess, setWaitDialogSuccess] = useState(false);
    const [waitDialogMessage, setWaitDialogMessage] = useState('');

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

    const handleNetworkClick = (index: number) => {
        setSelectedNetworkInfo(networks[index]);
        setSelectedIndex(index);
    };

    const handleSave = async () => {
        setShowWaitDialog(true);

        try {
            const gasPrice = await getGasPrice(selectedNetworkInfo.chainId, selectedNetworkInfo.rpcUrl);
            console.log('gasPrice',gasPrice)
            console.log('gasPrice type',typeof gasPrice)

            if (gasPrice !=0) {
                setWaitDialogSuccess(true);
                setWaitDialogMessage('保存成功');
                handleSaveNetwork(selectedNetworkInfo);
            } else {
                setWaitDialogSuccess(false);
                setWaitDialogMessage('连接网络失败');
            }
        } catch (error) {
            console.log(222)
            setWaitDialogSuccess(false);
            setWaitDialogMessage('连接网络失败');
        } finally {
            console.log(111)
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
                {networks.map((network, index) => (
                    <Typography
                        key={network.chainId}
                        variant="subtitle1"
                        component="div"
                        className={`network-name ${index === selectedIndex ? "selected" : ""}`}
                        onClick={() => handleNetworkClick(index)}
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
                                        Delete
                                    </Button>
                                </Grid>
                            )}
                            <Grid item>
                                <Button variant="outlined" onClick={handleSave}>
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                )}
            </Grid>
            <WaitDialog
                open={showWaitDialog}
                onClose={handleWaitDialogClose}
                isLoading={!waitDialogSuccess}
                isSuccess={waitDialogSuccess}
                failureMessage={waitDialogMessage}
            />
        </Grid>
    );
};

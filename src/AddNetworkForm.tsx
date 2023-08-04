import React, {useState} from 'react';
import {NetworkData} from "./NetworkData";
import {checkNetworkIdExists, getGasPrice} from "./background";
import {getDefaultNetworkData} from "./interface";
import Grid from '@mui/material/Grid';
import WaitDialog from "./WaitDialog";
import {Button, TextField} from '@mui/material';

interface AddNetworkFormProps {
    handleAddNetwork: (newNetwork: NetworkData) => void;
    networks: NetworkData[];
}

export const AddNetworkForm: React.FC<AddNetworkFormProps> = ({
                                                                  handleAddNetwork,
                                                                  networks,
                                                              }) => {
    const [newNetworkInfo, setNewNetworkInfo] = useState<NetworkData>(getDefaultNetworkData());
    const [showWaitDialog, setShowWaitDialog] = useState(false);
    const [waitDialogLoadingState, setWaitDialogLoadingState] = useState<"loading" | "success" | "failure">("loading");
    const [waitDialogMessage, setWaitDialogMessage] = useState('');

    const handleNetworkInfoChange = (field: keyof NetworkData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewNetworkInfo((prevNetworkInfo: any) => ({
            ...prevNetworkInfo,
            [field]: event.target.value,
        }));
    };

    const handleSave = async () => {
        setShowWaitDialog(true);
        if (checkNetworkIdExists(newNetworkInfo.chainId, networks)) {
            setWaitDialogLoadingState("failure");
            setWaitDialogMessage('网络ID已存在');
            return;
        }
        try {
            const gasPrice = await getGasPrice(newNetworkInfo.chainId, newNetworkInfo.rpcUrl);

            if (gasPrice !== 0) {
                setWaitDialogLoadingState("success");
                setWaitDialogMessage('添加成功');
                handleAddNetwork(newNetworkInfo);
            } else {
                setWaitDialogLoadingState("failure");
                setWaitDialogMessage('连接网络失败');
            }
        } catch (error) {
            setWaitDialogLoadingState("failure");
            setWaitDialogMessage('连接网络失败');
            console.error(error); // 处理错误
        }
    };

    const handleWaitDialogClose = () => {
        setShowWaitDialog(false);
    };

    return (
        <Grid
            container
            spacing={2}
            justifyContent="space-evenly"
            sx={{flexWrap: "wrap", p: 4}}
        >

            <Grid item xs={12} sm={6}>
                <div>
                    <TextField
                        label="Name"
                        value={newNetworkInfo.name}
                        fullWidth
                        sx={{mb: 1}}
                        onChange={handleNetworkInfoChange("name")}
                    />
                    <TextField
                        label="Chain ID"
                        value={newNetworkInfo.chainId.toString()}
                        fullWidth
                        sx={{mb: 1}}
                        onChange={handleNetworkInfoChange("chainId")}
                    />
                    <TextField
                        label="RPC URL"
                        value={newNetworkInfo.rpcUrl}
                        fullWidth
                        sx={{mb: 1}}
                        onChange={handleNetworkInfoChange("rpcUrl")}
                    />
                    <Grid
                        container
                        spacing={2}
                        justifyContent="flex-end"
                        alignItems="center"
                        sx={{mt: 2}}
                    >
                        <Grid item>
                            <Button variant="outlined" onClick={handleSave}>
                                添加
                            </Button>
                        </Grid>
                    </Grid>
                </div>
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

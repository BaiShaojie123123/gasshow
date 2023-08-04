import React, {useEffect, useState} from 'react';
import {CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography} from '@mui/material';
import {Cancel as CancelIcon, CheckCircle as CheckCircleIcon} from '@mui/icons-material';

interface WaitDialogProps {
    open: boolean;
    onClose: () => void;
    loadingState: "loading" | "success" | "failure";
    message: string;
}

const WaitDialog: React.FC<WaitDialogProps> = ({open, onClose, loadingState, message}) => {
    const [internalOpen, setInternalOpen] = useState(false);

    useEffect(() => {
        setInternalOpen(open);
    }, [open]);

    const renderDialogContent = () => {
        switch (loadingState) {
            case "loading":
                return (
                    <Grid item>
                        <CircularProgress/>
                    </Grid>
                );
            case "success":
                return (
                    <>
                        <Grid item>
                            <CheckCircleIcon color="primary" fontSize="large"/>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">{message}</Typography>
                        </Grid>
                    </>
                );
            case "failure":
                return (
                    <>
                        <Grid item>
                            <CancelIcon color="error" fontSize="large"/>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1">{message}</Typography>
                        </Grid>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={internalOpen} fullWidth maxWidth="xs" onClose={onClose}>
            <DialogTitle>
                <Grid container justifyContent="flex-end" alignItems="center">
                    {loadingState !== "success" && (
                        <IconButton onClick={onClose} color="inherit">
                            <CancelIcon/>
                        </IconButton>
                    )}
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    {renderDialogContent()}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default WaitDialog;

import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress, Typography, Grid, IconButton } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface WaitDialogProps {
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    isSuccess: boolean;
    failureMessage: string;
}

const WaitDialog: React.FC<WaitDialogProps> = ({
                                                   open,
                                                   onClose,
                                                   isLoading,
                                                   isSuccess,
                                                   failureMessage,
                                               }) => {
    const [internalOpen, setInternalOpen] = useState(false);

    useEffect(() => {
        setInternalOpen(open);
    }, [open]);

    console.log('isLoading',isLoading)
    console.log('isSuccess',isSuccess)
    return (
        <Dialog open={internalOpen} fullWidth maxWidth="xs" onClose={onClose}>
            <DialogTitle>
                <Grid container justifyContent="flex-end" alignItems="center">
                    {!isSuccess && (
                        <IconButton onClick={onClose} color="inherit">
                            <CancelIcon />
                        </IconButton>
                    )}
                </Grid>
            </DialogTitle>
            <DialogContent>
                <Grid container direction="column" alignItems="center" spacing={2}>
                    {isLoading ? (
                        <Grid item>
                            <CircularProgress />
                        </Grid>
                    ) : (
                        <>
                            {isSuccess ? (
                                <>
                                    <Grid item>
                                        <CheckCircleIcon color="primary" fontSize="large" />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1">
                                            Success
                                        </Typography>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item>
                                        <CancelIcon color="error" fontSize="large" />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1">
                                            {failureMessage}
                                        </Typography>
                                    </Grid>
                                </>
                            )}
                        </>
                    )}
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default WaitDialog;

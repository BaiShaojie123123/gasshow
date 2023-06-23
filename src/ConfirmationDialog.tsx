import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;  // 添加 onClose 属性
    onConfirm: (confirmed: boolean) => void;
}


const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                   open,
                                                                   title,
                                                                   message,
                                                                   onClose,
                                                                   onConfirm,
                                                               }) => {
    const [confirmationResult, setConfirmationResult] = useState<boolean | null>(null);

    const handleCancel = () => {
        setConfirmationResult(false);
        onClose();
    };

    const handleConfirm = () => {
        setConfirmationResult(true);
        onConfirm(true);
    };

    const handleClose = () => {
        setConfirmationResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>取消</Button>
                <Button variant="contained" color="error" onClick={handleConfirm}>
                    确定
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;

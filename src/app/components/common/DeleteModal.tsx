import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import {
    Close,
    DeleteForever,
    WarningAmber,
} from '@mui/icons-material';

interface DeleteModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    showWarningIcon?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ( {
    open,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName,
    confirmText = "Delete",
    cancelText = "Cancel",
    isLoading = false,
    showWarningIcon = true,
} ) => {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    backgroundImage: `
            linear-gradient(64.5deg, rgba(245,116,185,1) 14.7%, rgba(89,97,223,1) 88.7%)
          `,
                    backgroundBlendMode: 'multiply, screen, normal',
                    color: 'white',
                    padding: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '64px',
                }}
            >
                {showWarningIcon && (
                    <WarningAmber
                        sx={{
                            mr: 1,
                            fontSize: '1.5rem',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        }}
                    />
                )}
                {title}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent
                sx={{
                    padding: '32px 24px',
                    backgroundColor: '#f8f9fa',
                    textAlign: 'center',
                }}
            >
                {/* Warning Icon */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 59, 48, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid rgba(255, 59, 48, 0.2)',
                        }}
                    >
                        <DeleteForever
                            sx={{
                                fontSize: '2.5rem',
                                color: '#FF3B30',
                            }}
                        />
                    </Box>
                </Box>

                {/* Item Name */}
                {itemName && (
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            mb: 1,
                            fontSize: '1.1rem',
                        }}
                    >
                        "{itemName}"
                    </Typography>
                )}

                {/* Message */}
                <DialogContentText
                    sx={{
                        fontSize: '1rem',
                        color: '#666',
                        lineHeight: '1.6',
                        maxWidth: '400px',
                        margin: '0 auto',
                    }}
                >
                    {message}
                </DialogContentText>

                {/* Warning Note */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: '#fff3cd',
                        borderRadius: '8px',
                        border: '1px solid #ffeaa7',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#856404',
                            fontWeight: 'medium',
                            fontSize: '0.9rem',
                        }}
                    >
                        ⚠️ This action is permanent and cannot be undone
                    </Typography>
                </Box>
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    padding: '24px',
                    backgroundColor: '#f8f9fa',
                    justifyContent: 'center',
                    gap: 2,
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        minWidth: '120px',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        color: '#6c757d',
                        borderColor: '#dee2e6',
                        backgroundColor: 'white',
                        '&:hover': {
                            backgroundColor: '#f8f9fa',
                            borderColor: '#adb5bd',
                        },
                    }}
                    startIcon={<Close />}
                >
                    {cancelText}
                </Button>

                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                        minWidth: '120px',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        backgroundColor: '#FF3B30',
                        boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)',
                        '&:hover': {
                            backgroundColor: '#D32F2F',
                            boxShadow: '0 6px 16px rgba(255, 59, 48, 0.4)',
                        },
                        '&:disabled': {
                            backgroundColor: '#ffcdd2',
                            color: '#f8f9fa',
                        },
                    }}
                    startIcon={!isLoading && <DeleteForever />}
                >
                    {isLoading ? 'Deleting...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteModal;

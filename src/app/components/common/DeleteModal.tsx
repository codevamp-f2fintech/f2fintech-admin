import React from 'react';
import {
    Box,
    Button,
    Fade,
    IconButton,
    Modal,
    Paper,
    Typography,
    CircularProgress
} from '@mui/material';
import {
    Close as CloseIcon,
    DeleteForever as DeleteIcon,
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

const DeleteModal: React.FC<DeleteModalProps> = ({
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
}) => {
    return (
        <Modal
            closeAfterTransition
            open={open}
            onClose={onClose}
            aria-labelledby="delete-confirmation-modal"
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 400,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        bgcolor: 'background.paper',
                        outline: 'none',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            background: "#3f50b5",
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {showWarningIcon && <WarningAmber sx={{ color: '#fff', fontSize: 28 }} />}
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                                {title}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            disabled={isLoading}
                            sx={{
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3, bgcolor: "#f5f8ff", textAlign: 'center' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '3px solid rgba(255, 59, 48, 0.2)',
                                }}
                            >
                                <DeleteIcon
                                    sx={{
                                        fontSize: '2rem',
                                        color: '#FF3B30',
                                    }}
                                />
                            </Box>
                        </Box>

                        {itemName && (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1e3a5f',
                                    mb: 1,
                                    fontSize: '1.1rem',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                "{itemName}"
                            </Typography>
                        )}

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#4a5568',
                                mb: 2,
                                fontFamily: "'Inter', sans-serif"
                            }}
                        >
                            {message}
                        </Typography>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onClose}
                                disabled={isLoading}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderWidth: 1.5,
                                    color: '#1e3a5f',
                                    borderColor: '#c4d5eb',
                                    fontFamily: "'Inter', sans-serif",
                                    '&:hover': {
                                        borderWidth: 1.5,
                                        bgcolor: 'rgba(196, 213, 235, 0.2)',
                                        borderColor: '#1e3a5f',
                                    },
                                }}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={onConfirm}
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    fontFamily: "'Inter', sans-serif",
                                    background: '#FF3B30',
                                    boxShadow: '0 4px 12px rgba(255, 59, 48, 0.25)',
                                    '&:hover': {
                                        background: '#D32F2F',
                                        boxShadow: '0 6px 16px rgba(255, 59, 48, 0.4)',
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ffcdd2',
                                        color: '#f8f9fa',
                                    },
                                }}
                            >
                                {isLoading ? 'Deleting...' : confirmText}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
};

export default DeleteModal;

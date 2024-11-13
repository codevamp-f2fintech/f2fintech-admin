import React from 'react';
import {
    Box,
    Button,
    Fade,
    IconButton,
    Modal,
    Paper,
    Typography,
    TextField,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircleOutline as CheckIcon,
    DateRange as DateRangeIcon,
    Event as EventIcon,
} from '@mui/icons-material';
import dayjs, { Dayjs } from "dayjs";

interface DateRangeModalProps {
    open: boolean;
    handleClose: () => void;
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    setStartDate: (date: Dayjs) => void;
    setEndDate: (date: Dayjs) => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
    open,
    handleClose,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
}) => {
    return (
        <Modal
            closeAfterTransition
            open={open}
            onClose={handleClose}
            aria-labelledby="date-selection-modal"
        >
            <Fade in={open}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 360,
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        bgcolor: 'background.paper',
                        outline: 'none',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DateRangeIcon sx={{ color: '#fff', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                Select Date Range
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={handleClose}
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
                    <Box sx={{ p: 3 }}>
                        {/* Date Inputs Container */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {/* Start Date */}
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <EventIcon color="primary" sx={{ fontSize: 20 }} />
                                    Start Date
                                </Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    value={startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""}
                                    onChange={(e) => setStartDate(dayjs(e.target.value))}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f5f5f5',
                                            '&:hover': {
                                                bgcolor: '#eeeeee',
                                            },
                                            '&.Mui-focused': {
                                                bgcolor: '#ffffff',
                                                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                            {/* End Date */}
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        mb: 1,
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <EventIcon color="primary" sx={{ fontSize: 20 }} />
                                    End Date
                                </Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    value={endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""}
                                    onChange={(e) => setEndDate(dayjs(e.target.value))}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            bgcolor: '#f5f5f5',
                                            '&:hover': {
                                                bgcolor: '#eeeeee',
                                            },
                                            '&.Mui-focused': {
                                                bgcolor: '#ffffff',
                                                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                        {/* Action Buttons */}
                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleClose}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => { }}
                                startIcon={<CheckIcon />}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                                    },
                                }}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Fade>
        </Modal>
    );
};

export default DateRangeModal;

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
    onApply: ( startDate: Dayjs | null, endDate: Dayjs | null ) => void; // Add onApply callback
}

const DateRangeModal: React.FC<DateRangeModalProps> = ( {
    open,
    handleClose,
    startDate,
    endDate,
    onApply
} ) => {
    const [ tempStartDate, setTempStartDate ] = React.useState<Dayjs | null>( startDate ); // Temporary states
    const [ tempEndDate, setTempEndDate ] = React.useState<Dayjs | null>( endDate );

    const handleApply = () => {
        onApply( tempStartDate, tempEndDate ); // Call onApply with temporary state
        handleClose();
    };

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
                                <DateRangeIcon sx={{ color: '#fff', fontSize: 28 }} />
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
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
                        <Box sx={{ p: 3, bgcolor: "#f5f8ff" }}>
                            {/* Date Inputs Container */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* Start Date */}
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            mb: 1,
                                            color: '#1e3a5f',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            fontFamily: "'Inter', sans-serif"
                                        }}
                                    >
                                        <EventIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                                        Start Date
                                    </Typography>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        value={tempStartDate ? dayjs( tempStartDate ).format( "YYYY-MM-DD" ) : ""}
                                        onChange={( e ) => setTempStartDate( dayjs( e.target.value ) )}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: '#ffffff',
                                                '&:hover': {
                                                    bgcolor: '#f8f9fa',
                                                },
                                                '&.Mui-focused': {
                                                    bgcolor: '#ffffff',
                                                    boxShadow: '0 0 0 2px rgba(21, 101, 192, 0.2)',
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
                                            color: '#1e3a5f',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            fontFamily: "'Inter', sans-serif"
                                        }}
                                    >
                                        <EventIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                                        End Date
                                    </Typography>
                                    <TextField
                                        type="date"
                                        fullWidth
                                        value={tempEndDate ? dayjs( tempEndDate ).format( "YYYY-MM-DD" ) : ""}
                                        onChange={( e ) => setTempEndDate( dayjs( e.target.value ) )}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: '#ffffff',
                                                '&:hover': {
                                                    bgcolor: '#f8f9fa',
                                                },
                                                '&.Mui-focused': {
                                                    bgcolor: '#ffffff',
                                                    boxShadow: '0 0 0 2px rgba(21, 101, 192, 0.2)',
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
                                    Cancel
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleApply}
                                    startIcon={<CheckIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        fontFamily: "'Inter', sans-serif",
                                        background: '#3f50b5',
                                        boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
                                        '&:hover': {
                                            background: '#303f9f',
                                            boxShadow: '0 6px 16px rgba(21, 101, 192, 0.4)',
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

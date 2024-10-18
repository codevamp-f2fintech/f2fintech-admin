import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface TimeLoggingEstimate {
    timeSpent: string;
    originalEstimate: string;
}

interface ProgressBarProps {
    setOpenDialog: (open: boolean) => void;
    timeLoggingEstimate: TimeLoggingEstimate;
    progress: number;
    overage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    setOpenDialog,
    timeLoggingEstimate,
    progress,
    overage
}) => {
    return (
        <Box sx={{ position: 'relative', width: '100%', height: 8 }}
            onClick={() => setOpenDialog(true)}
        >
            {/* Green Progress (within estimate) */}
            <LinearProgress
                variant="determinate"
                value={progress > 100 ? 100 : progress}
                sx={{
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: 'lightgray',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#36B37E',
                        transition: 'all 0.3s ease'
                    },
                }}
            />
            {/* Orange Progress (exceeds estimate) */}
            {overage > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                    }}
                >
                    {/* Green part, reduced proportionally */}
                    <Box
                        sx={{
                            height: 8,
                            borderRadius: 2,
                            width: `${100 - overage}%`,
                            backgroundColor: '#36B37E',
                        }}
                    />
                    {/* Orange part */}
                    <Box
                        sx={{
                            height: 8,
                            borderRadius: 2,
                            width: `${overage}%`,
                            backgroundColor: '#FFAB00',
                        }}
                    />
                </Box>
            )}
            <Box display='flex' justifyContent='space-between'>
                {timeLoggingEstimate.timeSpent == 0 ? (
                    <>
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            No time logged
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            {timeLoggingEstimate.originalEstimate}
                        </Typography>
                    </>
                ) :
                    (
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            {timeLoggingEstimate.timeSpent} logged
                        </Typography>
                    )}
            </Box>
        </Box>
    );
};

export default ProgressBar;

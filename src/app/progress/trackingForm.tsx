import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import {
    Box,
    Divider,
    Typography,
    Button,
    Dialog,
    TextField,
    useMediaQuery,
    LinearProgress,
    Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";

import Loader from "../components/common/Loader";
import Toast from "../components/common/Toast";

import { Utility } from "@/utils";
import { useCreateTicket } from "@/hooks/ticket";

// Types
interface TimeLoggingEstimate {
    timeSpent: string;
    originalEstimate: string;
}

interface CreateTicketResponse {
    statusCode: number;
    data: Array<{}>;
}

interface FormComponentProps {
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
    timeLoggingEstimate: TimeLoggingEstimate;
    setTimeLoggingEstimate: (estimate: TimeLoggingEstimate) => void;
    progress: number;
    setProgress: (progress: number) => void;
    overage: number;
    setOverage: (overage: number) => void;
}

interface InitialValues {
    time_spent: string;
    work_description: string;
}

const initialValues: InitialValues = {
    time_spent: "",
    work_description: ""
};

function parseTimeSpent(timeSpent: string): number {
    const timeRegex = /(\d+)([hdm])/g;
    let totalHours = 0;
    let match;

    while ((match = timeRegex.exec(timeSpent)) !== null) {
        const [, value, unit] = match;
        const numericValue = parseInt(value, 10);

        switch (unit) {
            case 'h':
                totalHours += numericValue;
                break;
            case 'd':
                totalHours += numericValue * 8;
                break;
            case 'm':
                totalHours += numericValue / 60;
                break;
            default:
                break;
        }
    }
    return totalHours;
}

const TrackingForm: React.FC<FormComponentProps> = ({
    openDialog,
    setOpenDialog,
    timeLoggingEstimate,
    setTimeLoggingEstimate,
    progress,
    setProgress,
    overage,
    setOverage
}) => {
    const [loading, setLoading] = useState(false);
    const maxTime = parseTimeSpent(timeLoggingEstimate?.originalEstimate || "");
    const existingTimeSpent = parseTimeSpent(timeLoggingEstimate?.timeSpent || "");

    const initialTimeRemaining = Math.max(maxTime - existingTimeSpent, 0);
    const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);

    const toastInfo = useSelector((state: any) => state.toast);
    const dispatch = useDispatch();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    const { toastAndNavigate, getLocalStorage } = Utility();
    const storedTicketId = getLocalStorage("ticketId");

    const { createTicket } = useCreateTicket("create-ticket-log", {});

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    // Convert hours into a "Xd Yh" format
    const formatTimeInDaysHours = (hours: number): string => {
        const days = Math.floor(hours / 8);
        const remainingHours = hours % 8;
        return `${days}d${remainingHours > 0 ? ` ${remainingHours}h` : ""}`;
    };

    const handleTimeSpentChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        handleChange: (event: React.ChangeEvent<any>) => void
    ) => {
        const { value } = event.target;
        const newTimeSpentInHours = parseTimeSpent(value);
        const totalTimeSpentInHours = existingTimeSpent + newTimeSpentInHours;

        const remainingTime = Math.max(maxTime - totalTimeSpentInHours, 0);
        const formattedRemainingTime = formatTimeInDaysHours(remainingTime);

        setTimeRemaining(formattedRemainingTime);
        setTimeLoggingEstimate({
            ...timeLoggingEstimate,
            timeSpent: formatTimeInDaysHours(totalTimeSpentInHours)
        });

        const calculatedProgress = Math.min((totalTimeSpentInHours / maxTime) * 100, 100); // max 100%
        const calculatedOverage = totalTimeSpentInHours > maxTime ? ((totalTimeSpentInHours - maxTime) / maxTime) * 100 : 0;

        setProgress(calculatedProgress); // Update blue bar
        setOverage(calculatedOverage); // Update orange bar
        handleChange(event);
    };

    const createTracking = useCallback(
        async (values: InitialValues) => {
            setLoading(true);
            const data = {
                ticket_id: parseInt(storedTicketId.split('-')[1]),
                ...values
            }
            if (data) {
                try {
                    const createdResponse: CreateTicketResponse = await createTicket(data);
                    if (createdResponse?.statusCode === 200) {
                        console.log("Created Ticket Response:", createdResponse);
                        setLoading(false);
                        handleDialogClose();
                    }
                } catch (error) {
                    console.log("Error creating ticket log:", error);
                    toastAndNavigate(dispatch, true, "error", "Error Occurred, Please Try Again", null, null, true);
                } finally {
                    setLoading(false);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [storedTicketId, createTicket]
    );

    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="responsive-dialog-title"
                sx={{
                    top: isMobile ? "33%" : isTab ? "25%" : "20%",
                    height: isMobile ? "49%" : isTab ? "39%" : "60%",
                    "& .MuiPaper-root": {
                        width: "100%",
                        backgroundImage:
                            theme.palette.mode === "light"
                                ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85))`
                                : `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9))`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                    },
                }}
            >
                <Typography
                    fontSize="19px"
                    fontWeight="600"
                    display="inline-block"
                    textAlign="center"
                    marginTop="10px"
                >
                    Time tracking
                </Typography>
                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => createTracking(values)}
                >
                    {({
                        values,
                        errors,
                        touched,
                        dirty,
                        isSubmitting,
                        handleBlur,
                        handleChange,
                        handleSubmit
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box padding="20px" width="70%" mx="auto">
                                <Box sx={{ position: 'relative', width: '100%', height: 8 }}>
                                    {/* Blue Progress (within estimate) */}
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress > 100 ? 100 : progress} // Cap progress at 100%
                                        sx={{
                                            height: 8,
                                            borderRadius: 2,
                                            backgroundColor: 'lightgray',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#36B37E',
                                                transition: 'all 0.3s ease', // Smooth transition
                                            },
                                        }}
                                    />
                                    {/* Orange Progress (exceeds estimate) */}
                                    {overage > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0, // Start the orange bar from the beginning
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex', // Use flex to overlay bars
                                            }}
                                        >
                                            {/* Green part, reduced proportionally */}
                                            <Box
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 2,
                                                    width: `${100 - overage}%`, // Reduce green width based on overage
                                                    backgroundColor: '#36B37E',
                                                }}
                                            />
                                            {/* Orange part */}
                                            <Box
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 2,
                                                    width: `${overage}%`, // #FFAB00 width is the overage percentage
                                                    backgroundColor: '#FFAB00',
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                {/* Original estimate info */}
                                <Box display="flex" flexDirection='column' mt={2} ml={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        {timeLoggingEstimate.timeSpent ? `${timeLoggingEstimate.timeSpent} logged` : values.time_spent ? `${values.time_spent} logged` : null}
                                    </Typography>
                                    <Box display="flex" flexDirection='row'>
                                        <Typography variant="body2" color="textSecondary">
                                            The original estimate for this issue was
                                        </Typography>
                                        <Typography variant="body2" color="primary" ml={1}>
                                            {timeLoggingEstimate.originalEstimate}
                                        </Typography>
                                        <Tooltip title="Estimated time to complete this issue">
                                            <InfoIcon sx={{ ml: 1, fontSize: 16, cursor: "pointer" }} />
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Box
                                    display="grid"
                                    gridTemplateColumns="repeat(2, 1fr)"
                                    gap="20px"
                                    padding="20px"
                                    mt={4}
                                    bgcolor="#f9f9f9"
                                    borderRadius="8px"
                                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                                    width="400px"
                                >
                                    {/* Time Spent Field */}
                                    <TextField
                                        variant="filled"
                                        type="text"
                                        name="time_spent"
                                        label="Time Spent"
                                        onBlur={handleBlur}
                                        onChange={(e) => handleTimeSpentChange(e, handleChange)}
                                        value={values.time_spent}
                                        error={!!touched.time_spent && !!errors.time_spent}
                                        helperText={touched.time_spent && errors.time_spent}
                                    />

                                    {/* Time Remaining Field */}
                                    <TextField
                                        variant="filled"
                                        label="Time Remaining"
                                        disabled
                                        value={timeRemaining}
                                        fullWidth
                                    />

                                    <TextField
                                        variant="filled"
                                        name="work_description"
                                        label="Work Description"
                                        onChange={handleChange}
                                        value={values.work_description}
                                        error={
                                            !!touched.work_description && !!errors.work_description
                                        }
                                        helperText={
                                            touched.work_description && errors.work_description
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        multiline
                                        rows={4}
                                        sx={{ gridColumn: "span 2", width: "100%" }}
                                    />
                                </Box>
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="end" p="20px">
                                <Button
                                    color="error"
                                    variant="outlined"
                                    sx={{ mr: 3 }}
                                    onClick={handleDialogClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="info"
                                    variant="outlined"
                                    disabled={!dirty || isSubmitting}
                                >
                                    Save
                                </Button>
                                <Toast
                                    alerting={toastInfo.toastAlert}
                                    severity={toastInfo.toastSeverity}
                                    message={toastInfo.toastMessage}
                                />
                            </Box>
                        </form>
                    )}
                </Formik>
                {loading && <Loader />}
            </Dialog>
        </div>
    );
};

export default TrackingForm;

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import {
    Box,
    Divider,
    InputLabel,
    MenuItem,
    FormControl,
    Typography,
    Button,
    Dialog,
    Select,
    TextField,
    useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Loader from "../components/common/Loader";
import Toast from "../components/common/Toast";

import { Utility } from "@/utils";

// Types
interface FormComponentProps {
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
}

interface InitialValues {
    time: string;
    date: null;
}

const initialValues: InitialValues = {
    time: "",
    date: null,
};

const TrackingForm: React.FC<FormComponentProps> = ({ openDialog, setOpenDialog }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isMobile = useMediaQuery("(max-width:480px)");
    const isTab = useMediaQuery("(max-width:920px)");

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const [title, setTitle] = useState("Create");
    const [loading, setLoading] = useState(false);
    const [initialState, setInitialState] = useState<InitialValues>(initialValues);
    const toastInfo = useSelector((state: any) => state.toast);

    const router = useRouter();
    const dispatch = useDispatch();

    const { toastAndNavigate, getLocalStorage } = Utility();

    const createTracking = useCallback(
        (values: InitialValues) => {
            setLoading(true);
            console.log('entered values', values);

            //         API.SubjectAPI.createSubject(values)
            //             .then(({ data: subject }) => {
            //                 if (subject.status === "Success") {
            //                     setLoading(false);
            //                     toastAndNavigate(dispatch, true, "success", "Successfully Created");
            //                     setTimeout(() => {
            //                         handleDialogClose();
            //                         router.reload();
            //                     }, 2000);
            //                 } else {
            //                     setLoading(false);
            //                     toastAndNavigate(dispatch, true, "error", "An Error Occurred, Please Try Again");
            //                 }
            //             })
            //             .catch((err) => {
            //                 setLoading(false);
            //                 toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
            //             });
        },
        [dispatch, router, toastAndNavigate]
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
                    }
                }}
            >
                <Typography
                    fontSize='12px'
                    fontWeight="600"
                    display="inline-block"
                    textAlign="center"
                    marginTop="10px"
                >
                    Time tracking
                </Typography>
                <Formik
                    initialValues={initialState}
                    enableReinitialize
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
                        handleSubmit,
                        resetForm,
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <Box display="grid" gap="30px" gridTemplateColumns="repeat(2, minmax(0, 1fr))" padding="20px">
                                <TextField
                                    variant="filled"
                                    type="text"
                                    name="time"
                                    label="Time Spent"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.time}
                                    error={!!touched.time && !!errors.time}
                                    helperText={touched.time && errors.time}
                                />
                                {/* <FormControl
                                    variant="filled"
                                    sx={{ minWidth: 120 }}
                                    error={!!touched.status && !!errors.status}
                                >
                                    <InputLabel id="statusField">Status</InputLabel>
                                    <Select
                                        variant="filled"
                                        labelId="statusField"
                                        label="Status"
                                        name="status"
                                        value={values.status}
                                        onChange={handleChange}
                                    >
                                        {Object.keys(config.status).map((item) => (
                                            <MenuItem key={item} value={item}>
                                                {config.status[item]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl> */}
                            </Box>
                            <Divider />
                            <Box display="flex" justifyContent="end" p="20px">
                                <Button
                                    color="error"
                                    variant="contained"
                                    sx={{ mr: 3 }}
                                    onClick={handleDialogClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="info"
                                    variant="contained"
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

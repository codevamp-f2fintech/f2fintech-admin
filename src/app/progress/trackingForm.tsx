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
  useMediaQuery,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
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

const TrackingForm: React.FC<FormComponentProps> = ({
  openDialog,
  setOpenDialog,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width:920px)");

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const [title, setTitle] = useState("Create");
  const [loading, setLoading] = useState(false);
  const [initialState, setInitialState] =
    useState<InitialValues>(initialValues);
  const toastInfo = useSelector((state: any) => state.toast);

  const router = useRouter();
  const dispatch = useDispatch();

  const { toastAndNavigate, getLocalStorage } = Utility();

  const createTracking = useCallback(
    (values: InitialValues) => {
      setLoading(true);
      console.log("entered values", values);

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
              <Box padding="20px" width="70%" mx="auto">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography variant="body2" color="textSecondary">
                    No time logged
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    2d remaining
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={30}
                  sx={{ height: 8, borderRadius: 2, mb: 2 }}
                />

                {/* Original estimate info */}
                <Box display="flex" alignItems="center" mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    The original estimate for this issue was
                  </Typography>
                  <Typography variant="body2" color="primary" ml={1}>
                    2d
                  </Typography>
                  <Tooltip title="Estimated time to complete this issue">
                    <InfoIcon sx={{ ml: 1, fontSize: 16, cursor: "pointer" }} />
                  </Tooltip>
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
                    name="timeSpent"
                    label="Time Spent"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.timeSpent}
                    error={!!touched.timeSpent && !!errors.timeSpent}
                    helperText={touched.timeSpent && errors.timeSpent}
                    fullWidth
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

                  {/* Time Remaining Field */}
                  <TextField
                    variant="filled"
                    type="text"
                    name="timeRemaining"
                    label="Time Remaining"
                    value="2d"
                    fullWidth
                  />

                  {/* Date Field */}
                  <TextField
                    variant="filled"
                    type="date"
                    name="date"
                    label="Date"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.date}
                    error={!!touched.date && !!errors.date}
                    helperText={touched.date && errors.date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ gridColumn: "span 2", width: "50%" }}
                  />

                  <TextField
                    variant="filled"
                    name="workDescription"
                    label="Work Description"
                    onChange={handleChange}
                    value={values.workDescription}
                    error={
                      !!touched.workDescription && !!errors.workDescription
                    }
                    helperText={
                      touched.workDescription && errors.workDescription
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

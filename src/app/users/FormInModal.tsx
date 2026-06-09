"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Formik, Field } from "formik";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  Box,
  useMediaQuery,
  Dialog,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Wc,
  SupervisorAccount,
  Phone,
  Badge,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import Toast from "../components/common/Toast";
import Loader from "../components/common/Loader";
import UserSchema, { EditUserSchema } from "./Validation.jsx";

import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { UserAPI } from "@/apis/UserAPI";
import { Utility } from "@/utils";
import { getUserRole } from "@/utils/cookies";

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  designation: string;
  number: string;
  gender: string;
  role: string;
  status: string;
  id?: string | number;
}

interface FormComponentProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  updatePassword: boolean;
  setUpdatePassword: (value: boolean) => void;
  userId: string | null;
  refetch: () => Promise<any>;
}

const CREATE_INITIAL_VALUES: UserFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  designation: "",
  number: "",
  gender: "",
  role: "",
  status: "active",
};

const UserForm: React.FC<FormComponentProps> = ({
  openDialog,
  setOpenDialog,
  updatePassword,
  setUpdatePassword,
  userId,
  refetch,
}) => {
  const [title, setTitle] = useState<"Create" | "Edit">("Create");
  const [loading, setLoading] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<UserFormValues>(CREATE_INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const pwFieldRef = useRef<HTMLInputElement | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();
  const isMobile = useMediaQuery("(max-width:480px)");

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Initialize user role on component mount
  useEffect(() => {
    const role = getUserRole();
    setCurrentUserRole(role || "");
  }, []);

  const handleUpdatePassword = useCallback(() => {
    if (!updatePassword) {
      setFormValues((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      pwFieldRef?.current?.focus();
    }
    setUpdatePassword(!updatePassword);
  }, [updatePassword]);

  // Load existing data or set defaults
  useEffect(() => {
    if (userId) {
      setTitle("Edit");
      populateUserData(userId);
    } else {
      setFormValues({
        ...CREATE_INITIAL_VALUES,
        role: currentUserRole === "admin" ? "sub admin" : "",
      });
      setTitle("Create");
    }
  }, [userId, openDialog, currentUserRole]);

  const populateUserData = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const response = await UserAPI.getUserProfile(id);
      const data = response.data?.data || {};
      // Merge with safe defaults so confirmPassword doesn't break Formik
      setFormValues({
        ...CREATE_INITIAL_VALUES,
        ...data,
        password: "",         // clear for security — edit shows blank unless "Update Password" clicked
        confirmPassword: "",
      });
    } catch (err: any) {
      toastAndNavigate(dispatch, true, "error", err?.response?.data?.msg || "An Error Occurred");
      setTimeout(() => handleDialogClose(), 2200);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (values: UserFormValues) => {
    setLoading(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        designation: values.designation,
        number: values.number,
        gender: values.gender,
        role: values.role,
        status: "active",
      };
      await UserAPI.create(payload);
      toastAndNavigate(dispatch, true, "success", "User Created Successfully");
      setTimeout(() => {
        handleDialogClose();
        window.location.reload();
      }, 2200);
    } catch (error: any) {
      toastAndNavigate(dispatch, true, "error", error?.response?.data?.message || "Error creating user, please try again.");
      setTimeout(() => handleDialogClose(), 2200);
    } finally {
      setLoading(false);
    }
  }, [dispatch, toastAndNavigate]);

  const updateUser = useCallback(async (values: any) => {
    setLoading(true);
    try {
      const payload = { ...values };
      if (!updatePassword) {
        delete payload.password;
      }
      delete payload.confirmPassword; // never send to backend
      await UserAPI.updateUserProfile(payload);
      toastAndNavigate(dispatch, true, "info", "Successfully Updated");
      setTimeout(() => {
        handleDialogClose();
        window.location.reload();
      }, 2200);
    } catch (err: any) {
      toastAndNavigate(dispatch, true, "error", err?.response?.data?.message || "Error Occurred. Please Try Again");
      setTimeout(() => handleDialogClose(), 2200);
    } finally {
      setLoading(false);
    }
  }, [updatePassword]);

  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      color: "#0f172a",
      transition: "all 0.2s ease",
      alignItems: "center",
      "& .MuiInputBase-input": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "4px !important",
        fontSize: "14px",
        fontWeight: 500,
        color: "#0f172a",
      },
      "& .MuiSelect-select": {
        paddingTop: "14px",
        paddingBottom: "14px",
        paddingLeft: "4px !important",
        fontSize: "14px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#cbd5e1",
        borderWidth: "1px",
        transition: "all 0.2s ease",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3949ab", borderWidth: "2px" },
      "&.Mui-disabled .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
      "&.Mui-disabled": { backgroundColor: "#f1f5f9 !important" },
    },
    "& .MuiInputLabel-root": {
      color: "#475569",
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: "#ffffff",
      px: 0.5,
      "&.Mui-focused": { color: "#3949ab !important" },
    },
    "& .MuiInputAdornment-root": {
      color: "#3949ab !important",
      marginRight: "2px",
      display: "flex",
      alignItems: "center",
      "& *": { color: "#3949ab !important" },
    },
    "& .MuiSelect-icon": { color: "#64748b" },
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={openDialog}
      onClose={handleDialogClose}
      aria-labelledby="user-form-dialog"
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          width: "100%",
          maxWidth: "640px",
          overflow: "visible",
          bgcolor: "#fff",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Header Banner */}
        <Box
          sx={{
            minHeight: "64px",
            bgcolor: "#3f50b5",
            position: "relative",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "'Inter', sans-serif",
              fontSize: "22px",
            }}
          >
            {title} User
          </Typography>
          {userId && (
            <Button
              type="button"
              variant="outlined"
              onClick={handleUpdatePassword}
              sx={{
                cursor: "pointer",
                zIndex: 10,
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "13px",
                padding: "6px 20px",
                color: updatePassword ? "#ffcdd2" : "#ffffff",
                bgcolor: updatePassword ? "rgba(244, 67, 54, 0.4)" : "rgba(255, 255, 255, 0.15)",
                border: "none",
                "&:hover": {
                  bgcolor: updatePassword ? "rgba(244, 67, 54, 0.6)" : "rgba(255, 255, 255, 0.25)",
                  border: "none",
                },
              }}
            >
              {updatePassword ? "Cancel Update" : "Update Password"}
            </Button>
          )}
        </Box>

        {/* Avatar — Edit only */}
        {title === "Edit" && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: "-40px", mb: 1, zIndex: 2, pointerEvents: "none" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#1e3a5f",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "4px solid #fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                pointerEvents: "auto",
              }}
            >
              <SupervisorAccount sx={{ fontSize: 40 }} />
            </Box>
          </Box>
        )}

        <Box sx={{ p: 3, pt: title === "Create" ? 3 : 0 }}>
          <Formik
            initialValues={formValues}
            enableReinitialize
            validationSchema={title === "Create" || updatePassword ? UserSchema : EditUserSchema}
            onSubmit={(values) => {
              values.id ? updateUser(values) : createUser(values);
            }}
          >
            {({ values, errors, touched, handleChange, handleSubmit, isSubmitting, dirty }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  sx={{
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    p: 2.5,
                    border: "1px solid #f1f5f9",
                    mb: 2.5,
                    display: "grid",
                    gap: "20px",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  {/* Username */}
                  <Field
                    as={TextField}
                    autoFocus
                    fullWidth
                    label="*Username"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Person /></InputAdornment>
                      ),
                    }}
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />

                  {/* Email */}
                  <Field
                    as={TextField}
                    fullWidth
                    label="*Email Address"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Email /></InputAdornment>
                      ),
                    }}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />

                  {/* Designation — required */}
                  <Field
                    as={TextField}
                    fullWidth
                    label="*Designation"
                    name="designation"
                    value={values.designation}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Badge /></InputAdornment>
                      ),
                    }}
                    error={touched.designation && Boolean(errors.designation)}
                    helperText={touched.designation && errors.designation}
                  />

                  {/* Contact Number */}
                  <Field
                    as={TextField}
                    fullWidth
                    label="*Contact Number"
                    name="number"
                    value={values.number}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Phone /></InputAdornment>
                      ),
                    }}
                    error={touched.number && Boolean(errors.number)}
                    helperText={touched.number && errors.number}
                  />

                  {/* Password — shown on Create OR when Update Password is toggled in Edit */}
                  {(title === "Create" || updatePassword) && (
                    <Field
                      as={TextField}
                      fullWidth
                      name="password"
                      label="*Password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      inputRef={pwFieldRef}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Lock /></InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleTogglePassword} sx={{ color: "#64748b" }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  )}

                  {/* Confirm Password — shown alongside Password */}
                  {(title === "Create" || updatePassword) && (
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirmPassword"
                      label="*Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      sx={commonTextFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Lock /></InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleToggleConfirmPassword} sx={{ color: "#64748b" }}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  )}

                  {/* Gender */}
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Wc /></InputAdornment>
                      ),
                    }}
                    error={touched.gender && Boolean(errors.gender)}
                    helperText={touched.gender && errors.gender}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Field>

                  {/* Role */}
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="*Role"
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    sx={commonTextFieldStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><SupervisorAccount /></InputAdornment>
                      ),
                    }}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {currentUserRole === "super admin" && <MenuItem value="admin">Admin</MenuItem>}
                    {currentUserRole === "admin" && <MenuItem value="admin">Admin</MenuItem>}
                    {currentUserRole === "admin" && <MenuItem value="sub admin">Sub Admin</MenuItem>}
                    {currentUserRole === "admin" && <MenuItem value="sales">Sales</MenuItem>}
                    {currentUserRole === "admin" && <MenuItem value="operations">Operations</MenuItem>}
                    {currentUserRole === "admin" && <MenuItem value="credit">Credit</MenuItem>}
                  </Field>
                </Box>

                {/* Action Footer */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    pt: 2,
                    borderTop: "1px solid #e8edf5",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    onClick={handleDialogClose}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      borderRadius: "20px",
                      py: 1,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#f44336",
                      bgcolor: "rgba(244, 67, 54, 0.08)",
                      border: "none",
                      "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)", color: "#d32f2f", border: "none" },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!dirty || isSubmitting || loading}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      borderRadius: "20px",
                      py: 1,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      border: "none",
                      color: (!dirty || isSubmitting || loading) ? "#94a3b8" : "#00796B",
                      bgcolor: (!dirty || isSubmitting || loading) ? "#f1f5f9" : "rgba(0, 121, 107, 0.08)",
                      "&:hover": {
                        bgcolor: (!dirty || isSubmitting || loading) ? "#f1f5f9" : "rgba(0, 121, 107, 0.15)",
                        color: (!dirty || isSubmitting || loading) ? "#94a3b8" : "#004d40",
                        border: "none",
                      },
                      "&:disabled": { color: "#94a3b8", bgcolor: "#f1f5f9", border: "none" },
                    }}
                  >
                    {loading ? "Processing..." : "Submit"}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
          {loading ? <Loader /> : null}
          <Toast
            alerting={toast.toastAlert}
            severity={toast.toastSeverity}
            message={toast.toastMessage}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default UserForm;
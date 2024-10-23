"use client"; // Add this at the top

import { useState } from "react";

import {
  Avatar,
  Button,
  TextField,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { setLoading } from "@/redux/features/userSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

import { Utility } from "@/utils";
import { UserAPI } from "@/apis/UserAPI";
import Toast from "../../components/common/Toast";
import { Formik, Form, Field } from "formik";

import * as Yup from "yup";

// Regular expression for validating Gmail addresses
const emailRegExp = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const UserSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot be more than 20 characters")
    .required("Password is required")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/\d/, "Password must contain at least one number"),
  gender: Yup.string().required("Gender is required"),
  email: Yup.string()
    .matches(emailRegExp, "Email Address must be a Gmail address")
    .required("This field is required"),
});

const UserForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();

  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleSignup = async (values: any) => {
    setLoading(true);

    try {
      const registerInfo = {
        username: `${values.firstname} ${values.lastname}`,
        email: values.email,
        password: values.password,
        gender: values.gender,
      };

      const response = await UserAPI.create(registerInfo);
      toastAndNavigate(dispatch, true, "success", "User created successfully!");
    } catch (error) {
      toastAndNavigate(
        dispatch,
        true,
        "error",
        "Error signing up, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid
        item
        maxWidth={"false"}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          //   boxShadow: 3,
          width: "80vw",
          height: "75vh",
          //   background:
          //     "linear-gradient(235deg, #FFFFFF 0%, #000F25 100%), linear-gradient(180deg, #6100FF 0%, #000000 100%), linear-gradient(235deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%), linear-gradient(125deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%)",
          //   backgroundBlendMode: "soft-light, screen, darken, normal",
          // position: "fixed",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 70, height: 70 }}>
          <LockOutlined fontSize="large" />
        </Avatar>
        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: 2, fontSize: "2rem" }}
        >
          Create User
        </Typography>

        <Formik
          initialValues={{
            firstname: "",
            lastname: "",
            email: "",
            gender: "",
            password: "",
          }}
          validationSchema={UserSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            await handleSignup(values);
            setSubmitting(false);
            resetForm();
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            dirty,
          }) => (
            <Form>
              <Grid sx={{ width: "83vh" }} container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="firstname"
                    label="First Name"
                    name="firstname"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.firstname && Boolean(errors.firstname)}
                    helperText={touched.firstname && errors.firstname}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="lastname"
                    label="Last Name"
                    name="lastname"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.lastname && Boolean(errors.lastname)}
                    helperText={touched.lastname && errors.lastname}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "black" }} />
                        </InputAdornment>
                      ),

                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "black" }}
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    id="gender"
                    label="Gender"
                    name="gender"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.gender && Boolean(errors.gender)}
                    helperText={touched.gender && errors.gender}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Field>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: "8px",
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
                    transform: "scale(1.05)",
                    color: "black",
                  },
                }}
                disabled={!dirty || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Form>
          )}
        </Formik>
      </Grid>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </>
  );
};

export default UserForm;

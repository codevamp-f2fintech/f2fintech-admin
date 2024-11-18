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
  Wc,
  SupervisorAccount
} from "@mui/icons-material";

import { setLoading } from "@/redux/features/userSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

import { Utility } from "@/utils";
import { UserAPI } from "@/apis/UserAPI";
import Toast from "../components/common/Toast";
import { Formik, Form, Field } from "formik";

import * as Yup from "yup";
import Link from "next/link";
// Regular expression for validating email addresses
const emailRegExp = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = Yup.object().shape({
  firstname: Yup
    .string()
    .min(2, "Firstname is too short!")
    .max(20, "Firstname is too long!")
    .required("First name is required"),
  lastname: Yup.string(),
  password: Yup.string()
    .min(8, 'Password Must Be 8 Characters Long')
    .matches(/[A-Z]/, 'Password Must Contain At Least 1 Uppercase Letter')
    .matches(/[a-z]/, 'Password Must Contain At Least 1 Lowercase Letter')
    .matches(/[0-9]/, 'Password Must Contain At Least 1 Number')
    .matches(/[^\w]/, 'Password Must Contain At Least 1 Special Character')
    .max(20, "Password cannot be more than 20 characters")
    .required("This Field is Required"),
  gender: Yup.string(),
  email: Yup
    .string()
    .matches(emailRegExp, "Email address is not valid")
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
        // maxWidth={"false"}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: 3,
          width: "80vw",
          height: "100vh",
          background:
            "linear-gradient(235deg, #FFFFFF 0%, #000F25 100%), linear-gradient(180deg, #6100FF 0%, #000000 100%), linear-gradient(235deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%), linear-gradient(125deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%)",
          backgroundBlendMode: "soft-light, screen, darken, normal",
          position: "sticky",
        }}
      >
        <Link href="/dashboard" passHref>
          <Button
            variant="contained"
            // color="primary"
            sx={{
              m: 1,
              // background: "linear-gradient(45deg, #2c3ce3, #1976d2, #FFF)",
              background: "red",
              width: "13vw",
              height: 40,
              fontWeight: "Bold",
              fontSize: "1rem",
              borderRadius: "15px",
              "&:hover": {
                // background:
                  // "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
                transform: "scale(1.05)",
                color: "black",
                fontWeight: "Bold",
                fontSize: "1rem",
              },
            }}
          >
            Go to Dashboard
          </Button>
        </Link>
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
            role: "agent"
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
                    label="*First Name"
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
                    label="*Email Address"
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
                    label="*Password"
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
                    label="Gender"
                    name="gender"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Wc sx={{ color: "black" }} />
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
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="Role"
                    name="role"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SupervisorAccount sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      style: { color: "black", fontSize: "15px" },
                    }}
                    InputLabelProps={{ style: { color: "black" } }}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="agent">Agent</MenuItem>
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

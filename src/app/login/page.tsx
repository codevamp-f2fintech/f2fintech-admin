/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";
import { ThemeProvider, useTheme, Theme } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import Toast from "../components/common/Toast";
import { UserAPI } from "@/apis/UserAPI";
import type { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Password too short").required("Required"),
});

const Login = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { decodedToken, toastAndNavigate } = Utility();

  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const { data: response } = await UserAPI.login(values);
      if (response.statusCode === 200) {
        document.cookie = `token=${response.data.access_token
          }; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
        toastAndNavigate(dispatch, true, "success", response.data.message || "Login Successful");

        const role = decodedToken(response.data.access_token)?.role;
        if (role === "admin") {
          router.push("/dashboard");
        } else if (role === "agent") {
          router.push("/home");
        }
      }
    } catch (error: any) {
      toastAndNavigate(dispatch, true, "error", error.response.data.message ? error.response.data.message : "Error Loging In. Try Again");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          marginRight: "10vw",
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
        }}
      >
        <CssBaseline />
        <Grid
          item
          component={Paper}
          elevation={6}
          square
          sx={{
            height: "80vh",
            width: "70vw",
            borderRadius: "80px",
            marginRight: "15vh",
            background:
              "linear-gradient(235deg, #FFFFFF 0%, #000F25 100%), linear-gradient(180deg, #6100FF 0%, #000000 100%), linear-gradient(235deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%), linear-gradient(125deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%)",
            backgroundBlendMode: "soft-light, screen, darken, normal",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              background:
                "linear-gradient(235deg, #FFFFFF 0%, #000F25 100%), linear-gradient(180deg, #6100FF 0%, #000000 100%), linear-gradient(235deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%), linear-gradient(125deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%)",
              backgroundBlendMode: "soft-light, screen, darken, normal",
              transform: "scale(1.05)",
            },
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <Avatar
              src="/img/f2Fintechlogo.png" // Path relative to the public folder
              sx={{
                height: "20vh",
                width: "20vh",
                top: "-7vh",
                bgcolor: "white",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  background: "black",
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 14px rgba(0, 0, 0, 0.4)",
                },
              }}
            />

            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "2.3rem",
                fontWeight: "400",
                color: "white",
              }}
              component="h1"
              variant="h5"
            >
              Log In
            </Typography>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                await handleLogin(values);
                setSubmitting(false);
                resetForm();
              }}
            >
              {({ errors, touched, isSubmitting, dirty }) => (
                <Form>
                  <Field
                    as={TextField}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="off"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: "black" }} />
                        </InputAdornment>
                      ),
                      sx: { color: "white" },
                    }}
                    InputLabelProps={{
                      style: { color: "white" },
                    }}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={TextField}
                    margin="normal"
                    required
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
                      sx: { color: "white" },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "white" }}
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      style: { color: "white" },
                    }}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      mb: 2,
                      borderRadius: "8px",
                      background: "linear-gradient(45deg, #2C3CE3, #1976D2)",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1976D2, #6A1B9A)",
                      },
                    }}
                    disabled={!dirty || isSubmitting}
                  >
                    {isSubmitting ? "Loging in..." : "Log In"}
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </Grid>
      </Grid>
      <Toast
        alerting={toast.toastAlert}
        severity={toast.toastSeverity}
        message={toast.toastMessage}
      />
    </ThemeProvider>
  );
};
export default Login;

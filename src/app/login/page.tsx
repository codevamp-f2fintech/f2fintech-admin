"use client";

import * as React from "react";
import Link from "next/link";
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
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";
import { ThemeProvider, useTheme, Theme } from "@mui/material/styles";
import { UserAPI } from "@/apis/UserAPI";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { Utility } from "@/utils";
import Toast from "../components/common/Toast";

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Password too short").required("Required"),
});

const Login = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { toast } = useSelector((state: RootState) => state.toast);
  const { toastAndNavigate } = Utility();
  console.log("LOGIN PAGE");

  // Handler for toggling password visibility
  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  // Prevent default action for mouse down event on the password visibility toggle button
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  // Handler for form submission using Formik
  const handleLogin = async (values: { email: string; password: string }) => {
    console.log("login");
    try {
      const response = await UserAPI.login(values); // Call the UserAPI login method
      console.log("response", response);

      if (response?.data?.data.token) {
        // Save the token in a cookie manually
        document.cookie = `token=${
          response.data.data.token.access_token
        }; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;

        toastAndNavigate(dispatch, true, "success", "Signin Success");
        router.push("/home");
        // Handle successful login (e.g., redirect)
      }
    } catch (error) {
      toastAndNavigate(dispatch, true, "error", "Error Signin");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          marginRight: "40px",
          backgroundImage: 'url("img/front1.jpg")',
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
            backgroundImage: 'url("img/front.jpg")',
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundImage: `linear-gradient(rgba(200, 200, 220, 0.0), rgba(210, 230, 255, 0.7)), url("img/front.jpg")`,
              transform: "scale(1.05)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
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
              sx={{
                height: "15vh",
                width: "15vh",
                bgcolor: "secondary.main",
                top: "-5vh",
              }}
            >
              <LockOutlined sx={{ height: "8vh", width: "8vh" }} />
            </Avatar>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "2.3rem",
                fontWeight: "400",
              }}
              component="h1"
              variant="h5"
            >
              Sign In
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
                    }}
                    InputLabelProps={{
                      style: { color: "black" },
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "#1976d2" }}
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
                      style: { color: "black" },
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
                      background: "linear-gradient(45deg, #2c3ce3, #1976d2)",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "linear-gradient(45deg, #1976d2, #6A1B9A)",
                      },
                    }}
                    disabled={!dirty || isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>
              )}
            </Formik>
            <Grid container>
              <Grid item xs>
                <Link href="#" passHref>
                  <Typography sx={{ color: "#0000cc" }}>
                    Forgot password?
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" passHref>
                  <Typography sx={{ color: "#0000cc" }}>
                    Don&apos;t have an account? Sign Up
                  </Typography>
                </Link>
              </Grid>
            </Grid>
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

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
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
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

  // In your login component, after successful login:
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const { data: response } = await UserAPI.login(values);
      if (response.statusCode === 200) {
        const { userId, companyId, companyName, role, access_token } = response.data;
        console.log("this is console", userId, companyId, companyName, role, access_token);

        // Store token in cookie
        document.cookie = `oms_cookie=${access_token}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;

        // Store all data in localStorage
        localStorage.setItem('oms_cookie', access_token);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userRole', role);

        if (companyId) {
          localStorage.setItem('companyId', companyId.toString());
        }
        if (companyName) {
          localStorage.setItem('companyName', companyName);
        }

        // Store all data in cookies as well
        document.cookie = `userId=${userId.toString()}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
        document.cookie = `userRole=${role}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;

        if (companyId) {
          document.cookie = `companyId=${companyId.toString()}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
        }
        if (companyName) {
          document.cookie = `companyName=${companyName}; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
        }

        // Also decode token to verify
        const decoded = decodedToken(access_token);
        console.log('Stored data:', {
          userId: localStorage.getItem('userId'),
          companyId: localStorage.getItem('companyId'),
          companyName: localStorage.getItem('companyName'),
          userRole: localStorage.getItem('userRole')
        });

        toastAndNavigate(
          dispatch,
          true,
          "success",
          "Login Successful"
        );

        // Redirect based on role
        if (role === "super admin") {
          router.push("/super-admin-dashboard");
        } else if (role === "admin" || role === "sub admin" || role === "sales") {
          router.push("/dashboard");
        } else if (role === "operations" || role === "credit") {
          router.push("/home");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toastAndNavigate(
        dispatch,
        true,
        "error",
        error.response?.data?.message || "Error Logging In. Try Again"
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "1px solid var(--mui-palette-divider)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            width: "100%",
            height: { xs: "40vh", sm: "50vh", md: "60vh" },
            position: "relative",
            borderBottomLeftRadius: { xs: "20%", sm: "30%", md: "40%" },
            borderBottomRightRadius: { xs: "20%", sm: "30%", md: "40%" },
            mb: { xs: 45, sm: 45, md: 20 },
            backgroundColor: "#deebff",
          }}
        ></Box>
        <Grid
          item
          component={Paper}
          elevation={6}
          square
          sx={{
            position: "absolute",
            top: { xs: "5%", sm: "0%" },
            left: { xs: "5%", sm: "20%", md: "30%" },
            height: { xs: "85vh", sm: "89vh" },
            width: { xs: "90vw", sm: "60vw", md: "40vw" },
            mt: { xs: 5, sm: 10, md: 9 },
            borderRadius: "10px 10px 0px 0px",
            background: "linear-gradient(135deg, #fff 0%, #fff 100%)",
            boxShadow:
              "0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)",
            backgroundBlendMode: "soft-light, screen, darken, normal",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundBlendMode: "soft-light, screen, darken, normal",
            },
          }}
        >
          <Box
            sx={{
              my: { xs: 8, sm: 12, md: 18 },
              mx: { xs: 4, sm: 8, md: 15 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: { xs: "65vh", sm: "60vh", md: "55vh" },
            }}
          >
            <Avatar
              src="/img/f2Fintechlogo.png"
              sx={{
                height: { xs: "15vh", sm: "18vh", md: "20vh" },
                width: { xs: "15vh", sm: "18vh", md: "20vh" },
                top: { xs: "-5vh", sm: "-6vh", md: "-7vh" },
                bgcolor: "white",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                fontWeight: "400",
                color: "black",
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
                      sx: {
                        color: "black", // 🟢 text inside input
                        "& input::placeholder": {
                          color: "black", // 🟢 placeholder (if any)
                        },
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "black" }, // 🟢 label color
                    }}
                    FormHelperTextProps={{
                      sx: { color: "black" }, // 🟢 helper/error text color
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
                      sx: { color: "black" }, // Changed from "white" to "black"
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ color: "black" }}
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
                    sx={{
                      "& .MuiFormHelperText-root": {
                        color: "black", // Added to make helper text black
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: .7,
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

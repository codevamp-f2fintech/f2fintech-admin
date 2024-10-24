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
  const { decodedToken, toastAndNavigate } = Utility();
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
    try {
      const response = await UserAPI.login(values); // Call the UserAPI login method
      if (response?.data?.data.token) {
        // Save the token in a cookie manually
        document.cookie = `token=${
          response.data.data.token.access_token
        }; path=/; max-age=${1 * 24 * 60 * 60}; secure; samesite=strict`;
        toastAndNavigate(dispatch, true, "success", "Signin Success");
        const role = decodedToken(response.data.data.token.access_token)?.role;
        if (role === "admin") {
          router.push("/dashboard");
        } else if (role === "sales") {
          router.push("/dashboard");
        }
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
          background:
            "linear-gradient(125deg, #ECFCFF 0%, #ECFCFF 40%, #B2FCFF calc(40% + 1px), #B2FCFF 60%, #5EDFFF calc(60% + 1px), #5EDFFF 72%, #3E64FF calc(72% + 1px), #3E64FF 100%)",
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
                color: "white",
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
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>
              )}
            </Formik>
            {/* <Grid container>
              <Grid item xs>                    needs to be done
                <Link href="#" passHref>
                  <Typography sx={{ color: "#0000CC" }}>
                    Forgot password?
                  </Typography>
                </Link>
              </Grid>
            </Grid> */}
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

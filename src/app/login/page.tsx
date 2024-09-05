"use client";

import * as React from "react";
import { FormEvent, useEffect } from "react";

import axios from "axios";
import Link from "next/link";

import { useState, MouseEvent, ChangeEvent } from "react";
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
import { useRouter } from "next/navigation";
import { UserAPI } from "@/apis/UserAPI";

const Login = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler for email input change
  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  // Handler for password input change
  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value);
  };

  // Handler for toggling password visibility
  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  // Prevent default action for mouse down event on the password visibility toggle button
  const handleMouseDownPassword = (
    event: MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
  };

  // Handler for form submission
  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginInfo = { email, password };
      const response = await UserAPI.login(loginInfo); // Call the UserAPI login method
      console.log("Login successful:", response.data);
      // Handle success (e.g., store token, redirect, etc.)
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          padding: "40px",
          borderRadius: "50px",
          marginRight: "40px",
        }}
      >
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url("https://static.vecteezy.com/system/resources/previews/006/405/794/non_2x/account-login-flat-illustration-vector.jpg")',
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "left",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
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
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ mt: 1 }}
              onSubmit={(e) => handleLogin(e)}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#1976d2" }} />
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
              />

              {/* <FormControlLabel //for later use purpose
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              /> */}
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
              >
                Sign In
              </Button>

              <Grid container>
                <Grid item xs>
                  <Link href="#" passHref>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/signUp" passHref>
                    Don&apos;t have an account? Sign Up
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;

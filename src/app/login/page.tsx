"use client";

import * as React from "react";
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
import { url } from "inspector";

const Login = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const theme: Theme = useTheme();

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

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          // padding: "40px",
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
            // border: "2px solid black",
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
              backgroundImage: 'url("img/front.jpg")',
              transform: "scale(1.05)",
              // backgroundImage: 'url("img/front1.jpg")',
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
              // border: "2px solid blue",
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
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="off"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "black" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: {
                    color: "black", // Label color
                  },
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
                  style: {
                    color: "black", // Label color
                  },
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
          </Box>
        </Grid>
        <Grid item />
      </Grid>
    </ThemeProvider>
  );
};

export default Login;

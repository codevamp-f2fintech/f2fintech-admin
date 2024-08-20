"use client";
import React, { useState, MouseEvent } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ThemeProvider } from "@mui/material/styles";
import { useMode, ColorModeContext } from "../../../theme";

export default function SignUp() {
  const [theme, colorMode]: [Theme, { toggleColorMode: () => void }] =
    useMode();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (
    event: MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
  };
  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <Grid
          container
          component="main"
          sx={{
            height: "100vh",
            overflow: "hidden",
            borderRadius: "400px",
            marginRight: "40px",
          }}
        >
          <CssBaseline />
          <Grid
            item
            xs={12}
            sm={8}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: 3,
            }}
          >
            <Avatar
              sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Sign up
            </Typography>
            <Box component="form" noValidate sx={{ mt: 3, width: "100%" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{
                              color: "black",
                            }}
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                  />
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
                  background: "linear-gradient(45deg, #1976d2, #6A1B9A)",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #2c3ce3, #1976d2, #FFF)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <a
                    href="http://localhost:3000/login"
                    style={{ textDecoration: "none", color: "#1976d2" }}
                  >
                    Already have an account? Sign in
                  </a>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage:
                'url("https://plus.unsplash.com/premium_photo-1681487814165-018814e29155?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bG9naW58ZW58MHx8MHx8fDA%3D")',
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              }}
            />
          </Grid>
        </Grid>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}
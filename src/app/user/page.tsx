"use client";
import React, { useState, MouseEvent } from "react";
import { Theme } from "@emotion/react";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";

import { useMode, ColorModeContext } from "../../../theme";
import { setLoading } from "@/redux/features/userSlice";
import { UserAPI } from "@/apis/UserAPI";
import UserList from "./UserList";

const SignUp = () => {
  const [theme, colorMode]: [Theme, { toggleColorMode: () => void }] =
    useMode();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState(""); // New state
  const [password, setPassword] = useState(""); // New state
  const [username, setUsername] = useState(""); // New state
  const [error, setError] = useState("");
  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (
    event: MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
  };

  //Handle for form submission or Signup

  const handleSignup = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const registerInfo = { email, password, username };
      const response = await UserAPI.create(registerInfo);

      // Handle success (e.g., store token, redirect, etc.)
    } catch (error) {
      setError("Error signing up, please try again");
    } finally {
      setLoading(false);
    }
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
            display: "flex",
            backgroundImage: "url('/front.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            // border: "2px solid",
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
              boxShadow: 3,
              // backdropFilter: "blur(10px)",
              // border: "2px solid red",
            }}
          >
            <Avatar
              sx={{ m: 1, bgcolor: "primary.main", width: 70, height: 70 }}
            >
              <LockOutlined fontSize="large" />
            </Avatar>
            <Typography
              component="h1"
              variant="h5"
              sx={{ mb: 2, fontSize: "1.5rem" }}
            >
              Create User
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ mt: 3, width: "100%" }}
              onSubmit={(e) => handleSignup(e)}
            >
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
                          <Person
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { fontSize: "15px" },
                    }}
                    InputLabelProps={{
                      style: {
                        color: "black", // Label color
                      },
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
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                    InputLabelProps={{
                      style: {
                        color: "black", // Label color
                      },
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
                    autoComplete="off"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            sx={{
                              color: "black",
                            }}
                          />
                        </InputAdornment>
                      ),
                      style: { color: "#2c3ce3", fontSize: "15px" },
                    }}
                    InputLabelProps={{
                      style: {
                        color: "black", // Label color
                      },
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
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
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
                    InputLabelProps={{
                      style: {
                        color: "black", // Label color
                      },
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
                  bgcolor: "primary.main",
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
                Submit
              </Button>
            </Box>
          </Grid>
          <UserList />
        </Grid>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
};

export default SignUp;

"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const defaultTheme = createTheme({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          animation: "fadeIn 0.8s ease-out",
        },
      },
    },
  },
});

const useStyles = (theme) => ({
  root: {
    padding: theme.spacing(3),
    transition: "transform 0.5s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
});

function PasswordField() {
  const [values, setValues] = React.useState({
    password: "",
    showPassword: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <TextField
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type={values.showPassword ? "text" : "password"}
      id="password"
      autoComplete="current-password"
      value={values.password}
      onChange={handleChange("password")}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {values.showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

function BackgroundImage() {
  return (
    <Grid
      item
      xs={false}
      sm={4}
      md={7}
      sx={{
        backgroundImage:
          'url("https://static.vecteezy.com/system/resources/previews/006/405/794/non_2x/account-login-flat-illustration-vector.jpg")',
        backgroundColor: (t) =>
          t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
        backgroundSize: "cover",
        backgroundPosition: "left",
      }}
    />
  );
}

function SignInForm() {
  return (
    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
      <SignInBox />
    </Grid>
  );
}

function SignInBox() {
  return (
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
      <SignInAvatar />
      <SignInFields />
    </Box>
  );
}

function SignInAvatar() {
  return (
    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
      <LockOutlinedIcon />
    </Avatar>
  );
}

function SignInFields() {
  return (
    <>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <EmailField />
        <PasswordField />
        <RememberMeCheckbox />
        <SignInButton />
        <SignInLinks />
      </Box>
    </>
  );
}

function EmailField() {
  return (
    <TextField
      margin="normal"
      required
      fullWidth
      id="email"
      label="Email Address"
      name="email"
      autoComplete="email"
      autoFocus
    />
  );
}

function RememberMeCheckbox() {
  return (
    <FormControlLabel
      control={<Checkbox value="remember" color="primary" />}
      label="Remember me"
    />
  );
}

function SignInButton() {
  return (
    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
      Sign In
    </Button>
  );
}

function SignInLinks() {
  return (
    <Grid container>
      <Grid item xs>
        <Link href="#" passHref>
          <Typography component="a" variant="body2">
            Forgot password?
          </Typography>
        </Link>
      </Grid>
      <Grid item>
        <Link href="http://localhost:3000/signUp" passHref>
          <Typography component="a" variant="body2">
            {"Don't have an account? Sign Up"}
          </Typography>
        </Link>
      </Grid>
    </Grid>
  );
}

export default function SignInSide() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          padding: "50px",
          borderRadius: "50px",
          marginRight: "40px",
        }}
      >
        <CssBaseline />
        <BackgroundImage />
        <SignInForm />
      </Grid>
    </ThemeProvider>
  );
}

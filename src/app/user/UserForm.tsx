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
} from "@mui/icons-material";
import { setLoading } from "@/redux/features/userSlice";
import "react-toastify/dist/ReactToastify.css";
import { UserAPI } from "@/apis/UserAPI";
import { Formik, Form, Field } from "formik";
import { toast, ToastContainer } from "react-toastify";
import * as Yup from "yup";

// Validation schema using Yup
const UserSchema = Yup.object().shape({
  firstname: Yup.string().required("First name is required"),
  lastname: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  // number: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

const UserForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const [ blankForm , setBlankForm] = useState(null);

  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleSignup = async (values: any) => {
    setLoading(true);

    try {
      const registerInfo = {
        email: values.email,
        password: values.password,
        gender: values.gender,
        username: `${values.firstname} ${values.lastname}`,
      };

      const response = await UserAPI.create(registerInfo);
      toast.success("User created successfully!");
    } catch (error) {
      toast.error("Error signing up, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
      />
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
        }}
      >
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
          }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="firstname"
                    label="First Name"
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
                    id="lastname"
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
                    id="email"
                    label="Email Address"
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
                    id="gender"
                    label="Gender"
                    name="gender"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "black" }} />
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Form>
          )}
        </Formik>
      </Grid>
    </>
  );
};

export default UserForm;

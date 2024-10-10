import { CssBaseline, Grid } from "@mui/material";

import UserList from "./UserList";
import UserForm from "./UserForm";

const SignUp = () => {
  return (
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
      }}
    >
      <CssBaseline />
      <UserForm />
      <UserList />
    </Grid>
  );
};

export default SignUp;

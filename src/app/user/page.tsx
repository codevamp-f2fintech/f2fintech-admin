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
        // backgroundColor: "#b2ebf2",
        background:
          "linear-gradient(235deg, #FFFFFF 0%, #000F25 100%), linear-gradient(180deg, #6100FF 0%, #000000 100%), linear-gradient(235deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%), linear-gradient(125deg, #FFA3AC 0%, #FFA3AC 40%, #00043C calc(40% + 1px), #00043C 60%, #005D6C calc(60% + 1px), #005D6C 70%, #00C9B1 calc(70% + 1px), #00C9B1 100%)",
        backgroundBlendMode: "soft-light, screen, darken, normal",
        display: "flex",
      }}
    >
      <CssBaseline />
      <UserForm />
      <UserList />
    </Grid>
  );
};

export default SignUp;

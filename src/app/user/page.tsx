import { CssBaseline, Grid } from "@mui/material";

import UserList from "./UserList";
import UserForm from "./UserForm";

const SignUp = () => {
  return (
    <Grid maxWidth={"false"} container component="main">
      <CssBaseline />
      {/* <UserForm /> */}
      <UserList />
    </Grid>
  );
};

export default SignUp;

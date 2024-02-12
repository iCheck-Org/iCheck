import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountMenu from "./AccountMenu";

function ResponsiveDrawer(props) {
  const { firebaseUser } = props;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          backgroundColor: "rgb(36, 115, 211)",
        }}
      >
        <Toolbar>
          <Typography id="welcomeMessage" variant="h6" noWrap component="div">
            {firebaseUser && firebaseUser.name
              ? `Welcome, ${firebaseUser.name}!`
              : "Welcome!"}
          </Typography>

          <Box sx={{ ml: "auto" }} />
          <AccountMenu firebaseUser={firebaseUser} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ResponsiveDrawer;

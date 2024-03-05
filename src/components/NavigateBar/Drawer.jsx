import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountMenu from "./AccountMenu";
import '../../pages/styles.css';

const getCurrentTimeOfDay = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 22 || hour < 5) {
    return "night";
  } else if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else {
    return "evening";
  }
};

function ResponsiveDrawer(props) {
  const { firebaseUser } = props;
  const timeOfDay = getCurrentTimeOfDay();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          backgroundColor: "#37b0f2",
          zIndex: 100,
        }}
      >
        <Toolbar>
        <Typography
            id="logo-text"
            variant="h6"
            noWrap
            component="div"
          >
            iCheck.
          </Typography>

          <Typography
              id="welcomeMessage"
              variant="h6"
              noWrap
              component="div"
            >
              {firebaseUser && firebaseUser.name
                ? `Good ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}, ${firebaseUser.name}!`
                : `Good ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}!`}
            </Typography>

          <Box sx={{ ml: "auto" }} />
          <AccountMenu firebaseUser={firebaseUser} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ResponsiveDrawer;

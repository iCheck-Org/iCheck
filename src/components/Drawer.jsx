import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { db } from "../config/fire-base";
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/fire-base";

const drawerWidth = 220;

function ResponsiveDrawer(props) {
  const { window, user } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [firebaseUser,setFirebaseUser] = React.useState(null);
  
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }
        const userRef = doc(db,"users",user.uid);
        const userSnap = await getDoc(userRef);
        const userRecord = userSnap.data();

        setFirebaseUser(userRecord);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    console.log("Starting data fetching process...");
    fetchData();
  }, [user]);

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/"); // Redirect to the login page after logout
      })
      .catch((error) => {
        console.error("Error during logout:", error.message);
      });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(114% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
          {firebaseUser && firebaseUser.name ? `Welcome, ${firebaseUser.name}!` : 'Welcome!'}
          </Typography>
          <Box sx={{ ml: 'auto' }} />
          <button onClick={handleLogout}>Logout</button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
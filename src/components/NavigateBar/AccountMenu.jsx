import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import { auth } from "../../config/fire-base";
import Collapse from "@mui/material/Collapse";
import { signOut } from "firebase/auth";

export default function AccountMenu(props) {
  const { firebaseUser } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setProfileOpen(false); // Close profile details when menu is closed
  };

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen); // Toggle profile details visibility
  };

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
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 39, height: 39 }}>
              {firebaseUser.name[0]}{" "}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={handleProfileClick}
          sx={{
            backgroundColor: profileOpen ? "#e3f2fd" : "transparent", 
          }}
        >
          <Avatar /> Profile
        </MenuItem>
        <Collapse
          in={profileOpen}
          timeout="auto"
          unmountOnExit
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleClose} sx={{ fontSize: "small" }}>
            Name: {firebaseUser.name}
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ fontSize: "small" }}>
            ID: {firebaseUser.personal_id}
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ fontSize: "small" }}>
            Email: {firebaseUser.email}{" "}
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ fontSize: "small" }}>
            Type: {firebaseUser.type}
          </MenuItem>
        </Collapse>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "#ff5a4d" }}>
          <ListItemIcon sx={{ color: "#ff5a4d" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

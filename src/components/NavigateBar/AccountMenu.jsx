import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Logout from "@mui/icons-material/Logout";
import { auth } from "../../config/fire-base";
import { signOut } from "firebase/auth";
import "../../pages/styles.css";
import Typography from "@mui/material/Typography";

export default function AccountMenu(props) {
  const { firebaseUser } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isIconButtonClicked, setIsIconButtonClicked] = React.useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsIconButtonClicked(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsIconButtonClicked(false);
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
          <IconButton onClick={handleClick} size="small">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: isIconButtonClicked
                  ? "rgbargb(182, 213, 230, 0.001)"
                  : "#f0f0f0",
                color: "#374785"
              }}
            >
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
        className="menuStyle"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}

      >
        <div className="menuContent">
          <div className="menuBackground" />
          <Avatar sx={{ color: "#374785", bgcolor: "#f0f0f0" }}>
            <Typography fontSize={"x-large"}>{firebaseUser.name[0]}</Typography>
          </Avatar>
          <Typography
            sx={{ color: "#494f4e", fontSize: "15px", fontWeight: "bold" }}
          >
            {firebaseUser.name}
          </Typography>
          <Typography
            sx={{ marginTop: "-8px", color: "#494f4e", fontSize: "12px" }}
          >
            {firebaseUser.email}
          </Typography>
          <Box
            sx={{
              display: "inline-block",
              padding: "1px 6px",
              borderRadius: "5px",
              backgroundColor: "#f6efb7",
            }}
          >
            <Typography
              sx={{
                fontSize: "small",
                textTransform: "capitalize",
                color: "#494f4e",
              }}
            >
              {firebaseUser.type}
            </Typography>
          </Box>
          <Divider className="dividerStyle" sx={{ marginTop: "16px" }} />
          <IconButton
            onClick={handleLogout}
            sx={{ color: "#494f4e", marginTop: "3px" }}
          >
            <Tooltip title="Logout" enterDelay={"300"}>
              <Logout fontSize="small" />
            </Tooltip>
          </IconButton>
        </div>
      </Menu>
    </React.Fragment>
  );
}

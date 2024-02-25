import React from 'react';
import { IconButton } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import { green, grey } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import GetAppIcon from "@mui/icons-material/GetApp";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../config/Fire-base';
import Tooltip from '@mui/material/Tooltip';

const AssignmentDownload = ({ row, disabled }) => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const timer = React.useRef();

  const handleClick = async () => {
    if (!loading && !disabled) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(async () => {
        await handleFileDownload();
        setSuccess(true);
        setLoading(false);
      }, 1000);
    }
  };

  const handleFileDownload = async () => {
    try {
      const File_doc = row["File_doc"];
      const querySnapshot = await getDocs(collection(db, "pdfs"));
      querySnapshot.forEach((doc) => {
        if (doc.id === File_doc) {
          const downloadURL = doc.data().url;
          const filename = downloadURL.split("/").pop();
          const link = document.createElement("a");
          link.href = downloadURL;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
    } catch (error) {
      console.error("Error fetching document for download:", error);
    }
  };

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <Tooltip title="Download Assignment" followCursor>
    <IconButton
      aria-label="save"
      sx={{
        bgcolor: disabled ? "transparent" : success ? green[500] : "transparent",
        color: disabled ? grey[500] : success ? "#FFF" : grey[550], // Changed to grey for GetAppIcon
        width: 40,
        height: 40,
        boxShadow: disabled ? "none" : "none",
        opacity: disabled ? 0.5 : 1,
        "&:hover": {
          bgcolor: disabled ? "transparent" : success ? green[700] : "transparent",
        },
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      {success ? (
        <CheckIcon />
      ) : (
        <GetAppIcon />
      )}
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: green[500],
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -10,
            marginLeft: -10,
          }}
        />
      )}
    </IconButton>
    </Tooltip>
  );
};

export default AssignmentDownload;

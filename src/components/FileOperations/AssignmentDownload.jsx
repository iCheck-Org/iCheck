import React, { useState, useEffect, useRef } from "react";
import { IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { green, grey } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import GetAppIcon from "@mui/icons-material/GetApp";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/fire-base";
import Tooltip from "@mui/material/Tooltip";
import AlertSnackbar from "../MuiComponents/AlertSnackbar";

const AssignmentDownload = ({ row, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileDownloaded, setFileDownloadedSuccessfully] = useState(false);
  const timer = useRef(null);

  const handleClick = async () => {
    if (!loading && !disabled) {
      setLoading(true);
      timer.current = setTimeout(async () => {
        await handleFileDownload();
        setLoading(false);
      }, 1000);
    }
  };

  const handleFileDownload = async () => {
    try {
      const File_doc = row["file_doc"];
      const querySnapshot = await getDocs(collection(db, "pdfs"));
      querySnapshot.forEach((doc) => {
        if (doc.id === File_doc) {
          const downloadURL = doc.data().url;
          setTimeout(() => {
            window.open(downloadURL, '_blank');
          }, 600); // Delay of 2 seconds (2000 milliseconds)
          setFileDownloadedSuccessfully(true);
          setSuccess(true); // Set success state
        }
      });
    } catch (error) {
      console.error("Error fetching document for download:", error);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (fileDownloaded) {
      // Reset states after successful download
      timer.current = setTimeout(() => {
        setSuccess(false);
        setFileDownloadedSuccessfully(false);
      }, 2000);
    }
  }, [fileDownloaded]);

  return (
    <div>
      <Tooltip title="Download Assignment" followCursor>
        <span>
          <div style={{ position: "relative", display: "inline-block" }}>
            <IconButton
              aria-label="save"
              sx={{
                bgcolor: disabled
                  ? "transparent"
                  : success
                  ? green[500]
                  : "transparent",
                color: disabled ? grey[500] : success ? "#FFF" : grey[550],
                width: 40,
                height: 40,
                boxShadow: disabled ? "none" : "none",
                opacity: disabled ? 0.5 : 1,
                "&:hover": {
                  bgcolor: disabled
                    ? "transparent"
                    : success
                    ? green[700]
                    : "transparent",
                },
              }}
              onClick={handleClick}
              disabled={disabled || loading} // Disable button when loading
            >
              {success ? <CheckIcon /> : <GetAppIcon />}
            </IconButton>
            {loading && (
              <CircularProgress
                size={40}
                sx={{
                  color: green[500],
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            )}
          </div>
        </span>
      </Tooltip>
      <AlertSnackbar
        open={fileDownloaded} // Adjust this according to your Snackbar component
        setOpen={setFileDownloadedSuccessfully} // Adjust this according to your Snackbar component
        severity="success" // Adjust this according to your Snackbar component
        message="File was downloaded successfully" // Adjust this according to your Snackbar component
      />
    </div>
  );
};

export default AssignmentDownload;

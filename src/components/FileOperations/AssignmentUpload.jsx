import React, { useState } from "react";
import { IconButton } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { green, grey } from "@mui/material/colors";
import UploadIcon from "@mui/icons-material/Upload";
import CheckIcon from "@mui/icons-material/Check";
import {
  updateDoc,
  doc,
  collection,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../config/fire-base";
import Tooltip from "@mui/material/Tooltip";
import AlertSnackbar from "../MuiComponents/AlertSnackbar";
import "../../pages/styles.css";

export default function AssignmentUpload({ rowId, disabled, onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileUploaded, setFileUploadedSuccessfuly] = useState(false);

  const timer = React.useRef();

    const handleFileUpload = async () => {
        try {
            setLoading(true); // Set loading state when file input changes
            const fileInput = document.createElement("input");
            fileInput.type = "file";
    
            fileInput.addEventListener("change", async (event) => {
                const file = event.target.files[0];
                if (file) {
                    await handleSuccessClick();
                    setFileUploadedSuccessfuly(true);
                    const assignmentRef = doc(db, "assignments", rowId);
                    const assignmentDoc = await getDoc(assignmentRef);
                    const existingDocId = assignmentDoc.data().File_doc;
    
                    if (existingDocId) {
                        const storageRef = ref(storage, file.name);
                        await uploadBytes(storageRef, file);
    
                        // Update the existing document with the new storage URL and timestamp
                        await updateDoc(doc(db, "pdfs", existingDocId), {
                            name: file.name,
                            url: await getDownloadURL(storageRef),
                            timestamp: serverTimestamp(),
                        });
    
                        await updateDoc(assignmentRef, {
                            submissionDate: serverTimestamp(),
                            File_doc: existingDocId,
                        });
                    } else {
                        // If no document exists, create a new document
                        const storageRef = ref(storage, `pdfs/${file.name}`);
                        await uploadBytes(storageRef, file);
    
                        // Get the download URL and timestamp of the uploaded file
                        const downloadURL = await getDownloadURL(storageRef);
                        const timestamp = serverTimestamp();
    
                        // Create a new document in the "pdfs" collection
                        const newDocRef = await addDoc(collection(db, "pdfs"), {
                            name: file.name,
                            url: downloadURL,
                            timestamp: timestamp,
                        });
    
                        await updateDoc(assignmentRef, {
                            submissionDate: serverTimestamp(),
                            File_doc: newDocRef.id,
                        });
    
                        // Notify parent component of successful upload
                        onUploadSuccess(rowId);
                    }
                    
                    // Reset the fileUploaded state
                    setFileUploadedSuccessfuly(false);
                    setLoading(false); // Reset loading state when CheckIcon appears
                }
            });
    
            // Trigger the file input click
            fileInput.click();
        } catch (error) {
            console.error("Error uploading file:", error);
            setLoading(false); // Reset loading state on error
        }
    };
    

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleSuccessClick = async () => {
    if (!loading && !disabled) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(async () => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
      timer.current = setTimeout(async () => {
        setSuccess(false);
        setLoading(true);
      }, 4000);
    }
  };

    return (
        <Tooltip title="Upload Assignment" followCursor>
            <span>
                <IconButton
                    aria-label="save"
                    sx={{
                        bgcolor: disabled ? "transparent" : success ? green[500] : "transparent",
                        color: disabled ? grey[500] : success ? "#FFF" : grey[550],
                        width: 40,
                        height: 40,
                        boxShadow: "none",
                        opacity: disabled ? 0.5 : 1,
                        "&:hover": {
                            bgcolor: disabled ? "transparent" : success ? green[700] : grey[200],
                        },
                    }}
                    onClick={handleFileUpload}
                    disabled={disabled}
                >
                    {success ? (
                        <div style={{ position: 'relative', width: 20, height: 20 }}>
                            <CheckIcon
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                            <AlertSnackbar
                                open={fileUploaded}
                                setOpen={setFileUploadedSuccessfuly}
                                severity="success"
                                message="File was uploaded successfully"
                            />
                        </div>
                    ) : (
                        <UploadIcon />
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
            </span>
        </Tooltip>
    );
};

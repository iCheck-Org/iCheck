import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop } from "@mui/material";
import {
  updateDoc,
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import GetAppIcon from "@mui/icons-material/GetApp";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../config/Fire-base";
import Tabs from "./Tabs/TabsMenu";
import { AssignmentDownload } from "./AssignmentDownload";
import AlertSnackbar from "./MuiComponents/AlertSnackbar";
import '../pages/styles.css';

const TableStudent = ({ firebaseUser }) => {
  const [fileUploaded, setFileUploadedSuccessfuly] = useState(false);
  const [fileDownloaded, setFileDownloadedSuccessfuly] = useState(false);

  const columns = [
    { 
      field: "Course",
      headerName: "Course Name",
      width: 200,
      align: "left"
    },
    {
      field: "Assignment No.",
      headerName: "Assignment No.",
      width: 150,
      align: "left",
    },
    {
      field: "Due Date",
      headerName: "Due Date",
      width: 200,
      align: "left",
      valueFormatter: (params) => {
        // Convert timestamp to Date object
        const dueDate = params.value && params.value.toDate();

        // Format the Date object to a human-readable string
        return dueDate ? format(dueDate, "dd/MM/yyyy, HH:mm:ss") : "";
      },
    },
    {
      field: "Checker",
      headerName: "Status",
      width: 200,
      align: "left",
      renderCell: (params) => {
        let status = params.value;

        if (!status) {
          status = "Unchecked";
        } else {
          status = "Checked by " + status;
        }

        let backgroundColor = "";
        if (status === "Unchecked") {
          backgroundColor = "#FFE0B2"; // Orange color when status is 'Unchecked'
        } else {
          backgroundColor = "#C8E6C9"; // Green color for other statuses
        }

        return (
          <div style={{ backgroundColor, padding: "8px", borderRadius: "4px" }}>
            {status}
          </div>
        );
      },
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: 200,
      align: "left",
      renderCell: (value) => {
        const File_doc = value.row["File_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["Due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate >= currentDate;

        // Logic for displaying the icon buttons and enabling the functionality
        const isClickableUpload = isPastDueDate;
        const isClickableDownload =
          File_doc !== null && File_doc !== undefined && File_doc !== "";
        const isClickableShow = value.row.Grade !== "";

        const handleFileUpload = async (rowId) => {
          try {
            const fileInput = document.createElement("input");
            fileInput.type = "file";

            fileInput.addEventListener("change", async (event) => {
              const file = event.target.files[0];
              if (file) {
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

                  // Update the corresponding document in the "assignments" collection
                  await updateDoc(assignmentRef, { File_doc: existingDocId });
                } 
                else {
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

                  // Update the corresponding document in the "assignments" collection
                  await updateDoc(assignmentRef, { File_doc: newDocRef.id });
                }
                setFileUploadedSuccessfuly(true); // Corrected the setter function name
                // Update the state to indicate a successful file upload
                //TODO(IK): is there a use for this?
                setFileUploaded(true);
              }
            });

            // Trigger the file input click
            fileInput.click();
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        };

        const [showTabs, setShowTabs] = useState(false);
        return (
          <div>
            <IconButton
              id="Download"
              onClick={() => AssignmentDownload(value.row , firebaseUser)}
              disabled={!isClickableDownload}
              title="Download Assignment"
            >
              <GetAppIcon />
            </IconButton>
            <IconButton
              id="Upload"
              onClick={() => handleFileUpload(value.row.id)}
              disabled={!isClickableUpload}
              title="Upload Assignment"
            >
              <UploadIcon />
            </IconButton>
            <IconButton
              id="Review"
              onClick={() => {
                console.log(value.row.id),
                  setShowTabs((prevState) => !prevState);
              }}
              disabled={!isClickableShow}
              title="View Review"
            >
              <VisibilityIcon />
            </IconButton>
            {showTabs && (
              <Tabs
                assignment={value.row}
                onClose={() => setShowTabs((prevState) => !prevState)}
                typePermision={firebaseUser.type}
              />
            )}
          </div>
        );
      },
    },
  ];

  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!firebaseUser) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }

        const assignmentsSnapshot = await getDocs(
          query(
            collection(db, "assignments"),
            where("Owner", "==", firebaseUser.id) // TODO : id?!?!
          )
        );

        const data = await Promise.all(
          assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();
            const courseName = assignmentData.Course_name;

              // Return the assignment data along with the course name
              return {
                id: doc.id,
                ...assignmentData,
                Course: courseName,
              };
          })
        );

        setRows(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    console.log("Starting data fetching process...");
    fetchData();
  }, [firebaseUser]);

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  return (
    <Box height={400} width={1024} style={{ position: "relative" }}>
      <div style={{ height: '140%', width: '100%' }}>
        <DataGrid columns={columns} rows={rows} />
      </div>
      <AlertSnackbar
        open={fileUploaded}
        setOpen={setFileUploadedSuccessfuly}
        severity="success"
        message="File was uploaded successfully"
      />
      <AlertSnackbar
        open={fileDownloaded}
        setOpen={setFileDownloadedSuccessfuly}
        severity="success"
        message="File was downloaded successfully"
      />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadOpen}
        onClick={handleUploadClose}
      ></Backdrop>
    </Box>
  );
};

export default TableStudent;

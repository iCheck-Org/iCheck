import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop, Typography } from "@mui/material";
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
import BackDropSample from "./BackDropSample";
import { format } from "date-fns";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../config/fire-base";
import ReviewView from "./ReviewView";

const TableTest = ({ firebaseUser }) => {
  const [showReviewView, setShowReviewView] = useState(false); // Move showReviewView state to the TableTest component

  const columns = [
    { field: "Course", headerName: "Course Name", width: 200 },
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

      renderCell: (value) => {
        const File_doc = value.row["File_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["Due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate >= currentDate;

        const isClickableUpload = isPastDueDate;
        const isClickableDownload =
          File_doc !== null && File_doc !== undefined && File_doc !== "";
        const isClickableShow = value.row.Grade !== "";

        const onDownload = async (row) => {
          try {
            const userId = firebaseUser.id;
            const File_doc = row["File_doc"]; // Access the row object and get the value of "File_doc"

            // Fetch all documents from the "pdfs" collection
            const querySnapshot = await getDocs(collection(db, "pdfs"));
            // Iterate through each document
            querySnapshot.forEach((doc) => {
              // Compare the File_doc with the document ID
              if (doc.id === File_doc) {
                const downloadURL = doc.data().url;

                // Trigger the file download
                const filename = downloadURL.split("/").pop();
                const link = document.createElement("a");
                link.href = downloadURL;
                link.setAttribute("download", filename); // Set the download attribute
                document.body.appendChild(link);
                link.click();
                link.remove();
              }
            });
          } catch (error) {
            console.error("Error fetching document for download:", error);
          }
        };

        const handleFileUpload = async (rowId) => {
          try {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
        
            fileInput.addEventListener("change", async (event) => {
              const file = event.target.files[0];
              if (file) {
                const course = value.row.Course;
                const assignmentNo = value.row["Assignment No."];
        
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
        
                  // Update the corresponding document in the "assignments" collection
                  await updateDoc(assignmentRef, { File_doc: newDocRef.id });
                }
        
                // Update the state to indicate a successful file upload
                setFileUploaded(true);
              }
            });
        
            // Trigger the file input click
            fileInput.click();
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        };

        const [showReviewView, setShowReviewView] = useState(false);
        return (
          <div>
            <IconButton
              onClick={() => onDownload(value.row)}
              disabled={!isClickableDownload}
              title="Download Assignment"
            >
              <GetAppIcon />
            </IconButton>
            <IconButton
              onClick={() => handleFileUpload(value.row.id)}
              disabled={!isClickableUpload}
              title="Upload Assignment"
            >
              <UploadIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                console.log(value.row.id),
                  setShowReviewView((prevState) => !prevState);
              }}
              disabled={!isClickableShow}
              title="View Review"
            >
              <VisibilityIcon />
            </IconButton>
            {showReviewView && (
              <ReviewView
                assignmentID={value.row.id}
                onClose={() => setShowReviewView((prevState) => !prevState)}
              />
            )}
          </div>
        );
      },
    },
  ];

  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

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
            where("Owner", "==", firebaseUser.id)
          )
        );
    
        const data = await Promise.all(
          assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();
            const courseId = assignmentData["Course-ref"];
    
            const coursesSnapshot = await getDocs(collection(db, "courses-test"));
    
            // Find the course document with matching courseId
            const courseDoc = coursesSnapshot.docs.find((course) => course.id === courseId);
    
            if (courseDoc) {
              const courseData = courseDoc.data();
              const courseName = courseData.name;
    
              // Return the assignment data along with the course name
              return {
                id: doc.id,
                ...assignmentData,
                Course: courseName,
              };
            } else {
              // If no matching course document is found, log a message and return assignment data without modifying
              console.log(`Course document with ID ${courseId} does not exist.`);
              return {
                id: doc.id,
                ...assignmentData,
              };
            }
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

  const handleUploadOpen = (rowId) => {
    setSelectedRowId(rowId);
    setUploadOpen(true);
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  const handleReviewViewToggle = () => {
    setShowReviewView((prevState) => !prevState); // Toggle the showReviewView state
  };

  return (
    <Box height={400} width={1024} style={{ position: "relative" }}>
      <img
        src="/src/logo/icheck_logo_1.png"
        alt="Logo"
        className="dashboard-logo"
        style={{ marginBottom: "10px" }}
      />
      <DataGrid columns={columns} rows={rows} autoHeight={true} />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadOpen}
        onClick={handleUploadClose}
      >
        <Box>{showReviewView}</Box>
      </Backdrop>
    </Box>
  );
};

export default TableTest;

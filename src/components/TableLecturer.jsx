import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop, Typography } from "@mui/material";
import { updateDoc, doc, collection, getDoc , getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import GetAppIcon from "@mui/icons-material/GetApp";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BackDropSample from "./BackDropSample";
import { format } from 'date-fns';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../config/fire-base";
import CreateAssignment from "./CreateAssignment";




const TableLecturer = ({ firebaseUser }) => {


const columns = [
  {field: "Student_ID", headerName: "Student_ID", width: 130 },
  {field: "Course", headerName: "Course", width: 130 },
  {field: "Assignment No.",headerName: "Assignment No.",width: 140,align: "center",},
  {field: "Checked by", headerName: "Checked by", width: 150 },
  {field: "Submission Date",headerName: "Submission Date",width: 440,
    valueFormatter: (params) => {
      // Convert timestamp to Date object
      const dueDate = params.value && params.value.toDate();

      // Format the Date object to a human-readable string
      return dueDate ? format(dueDate, "HH:mm:ss , dd-MM-yyyy") : "";
    },
  },
  {field: "Actions",headerName: "Actions",width: 140,
    renderCell: (value) => {
      const onDownload = async (row) => {
        try {
          const userId = firebaseUser.id
          const File_doc = row["File_doc"]; // Access the row object and get the value of "File_doc"
          console.log(File_doc);
          // Fetch all documents from the "pdfs" collection
          const querySnapshot = await getDocs(collection(db, "pdfs"));
          // Iterate through each document
          querySnapshot.forEach(doc => {
            console.log(doc.id);
            // Compare the File_doc with the document ID
            if (doc.id === File_doc) {
              console.log("I am here 2");
              const downloadURL = doc.data().url;
        
              // Trigger the file download
              const filename = downloadURL.split("/").pop();
              const link = document.createElement("a");
              link.href = downloadURL;
              link.setAttribute("download", filename);  // Set the download attribute
              document.body.appendChild(link);
              link.click();
              link.remove();
            }
          });
        } catch (error) {
          console.error("Error fetching document for download:", error);
        }
      };        
      
      

      return (
        <div>
          <IconButton onClick={() => onDownload(value.row)}>
          <GetAppIcon />
          </IconButton>

          <IconButton onClick={() => handleFileUpload(value.row.id)}>
            <VisibilityIcon />
          </IconButton>
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
      
          // Fetch user ID
          const userId = firebaseUser.id;
      
          // Fetch user document
          const userDoc = firebaseUser;
      
          // Get the courses array from the user document
          const userCourses = userDoc.courses || [];
      
          // Fetch assignments that match the user's courses
          const assignmentsSnapshot = await getDocs(
            query(collection(db, "assignments"), where("Course-ref", "in", userCourses))
          );
      
          // Map the fetched assignments data
          const data = await Promise.all(assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();
            
            // Fetch corresponding user document based on the 'Owner' field
            const userQuerySnapshot = await getDocs(query(collection(db, "users"), where("id", "==", assignmentData.Owner)));
            
            // Check if a matching user document exists
            if (!userQuerySnapshot.empty) {
              // Get the student_id from the user document
              const studentId = userQuerySnapshot.docs[0].data().student_id;
              // Return modified assignment data with the student_id
              return {
                id: doc.id,
                ...assignmentData,
                Student_ID: studentId // Add the Student_ID field to the assignment data
              };
            } else {
              // If no matching user document found, return assignment data without modifying
              return {
                id: doc.id,
                ...assignmentData
              };
            }
          }));
      
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

  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  return (
    
     <Box height={500} width={1300}>
      <Box height={80} width={1300}>
        {/* Use a function to toggle the state */}
        <button onClick={() => setShowCreateAssignment(prevState => !prevState)}>Upload Assignment</button>
      </Box>

      {/* Conditionally render the CreateAssignment component */}
      {showCreateAssignment && <CreateAssignment firebaseUser={firebaseUser} onClose={() => setShowCreateAssignment(false)} />}

      <DataGrid columns={columns} rows={rows} />
      
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadOpen}
        onClick={handleUploadClose}
      >
        <Box>
          {selectedRowId && (
            <BackDropSample rowId={selectedRowId} onClose={handleUploadClose} />
          )}
        </Box>
      </Backdrop>
    </Box>
  );
};

export default TableLecturer;

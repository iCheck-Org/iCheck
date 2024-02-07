  import React, { useState, useEffect } from "react";
  import { DataGrid } from "@mui/x-data-grid";
  import { Box, IconButton, Backdrop, Typography } from "@mui/material";
  import { updateDoc, doc, collection, getDoc , getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
  import GetAppIcon from "@mui/icons-material/GetApp";
  import VisibilityIcon from "@mui/icons-material/Visibility";
  import BackDropSample from "./BackDropSample";
  import { format } from 'date-fns';
  import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { db } from "../config/fire-base";
  import Review from "./Review";






  const TableChecker = ({ user }) => {

    
    const fetchUserId = async (db, userUid) => {
      try {
        // Query the 'users' collection where the 'id' field equals the user's UID
        const querySnapshot = await getDocs(
        query(collection(db, "users"), where("id", "==", userUid))
      );

      // If a document is found, return its document ID
      if (!querySnapshot.empty) {
        const userId = querySnapshot.docs[0].id;
        return userId;
      } else {
        // If no document is found, return null
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID from Firestore:", error);
      return null;
    }
  };

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
            const userId = await fetchUserId(db, user.uid);
            const File_doc = row["File_doc"]; // Access the row object and get the value of "File_doc"
            console.log(File_doc);
            // Fetch all documents from the "pdfs" collection
            const querySnapshot = await getDocs(collection(db, "pdfs"));
            // Iterate through each document
            querySnapshot.forEach(doc => {
              console.log(doc.id);
              // Compare the File_doc with the document ID
              if (doc.id === File_doc) {

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
        
        const [showReview, setShowReview] = useState(false);
        return (
          <div>
            <IconButton onClick={() => onDownload(value.row)}>
            <GetAppIcon />
            </IconButton>

            <IconButton onClick={() => setShowReview(prevState => !prevState)}>
              <VisibilityIcon />
            </IconButton>
            {/* Conditionally render the CreateAssignment component */}
            {showReview && <Review user={user} onClose={() => setShowReview(false)} />}
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
      if (!user) {
      console.log("User is not defined. Aborting data fetching.");
      return;
      }

    // Fetch user ID
    const userId = await fetchUserId(db, user.uid);

    // Fetch user document
    const userDoc = await getDoc(doc(db, "users", userId));

    // Get the courses array from the user document
    const userCourses = userDoc.data().courses || [];

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
    }, [user]);

    const handleUploadOpen = (rowId) => {
      setSelectedRowId(rowId);
      setUploadOpen(true);
    };

    const handleUploadClose = () => {
      setUploadOpen(false);
    };

    return (
      <Box height={400} width={1300}>
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

  export default TableChecker;

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





const TableLecturer = ({ user }) => {

  
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
  {field: "Id", headerName: "Id", width: 130 },
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

      const onDownload = async () => {
        try {
          const userId = await fetchUserId(db, user.uid);
          const course = value.row.Course;
          const assignmentNo = value.row["Assignment No."];
      
          // Query the "pdfs" collection based on course, assignmentNo, and userId
          const querySnapshot = await getDocs(
            query(
              collection(db, "pdfs"),
              where("course", "==", course),
              where("assignmentNo", "==", assignmentNo),
              where("userId", "==", userId)
            )
          );
      
          // Check if a document is found
          if (!querySnapshot.empty) {
            const downloadURL = querySnapshot.docs[0].data().url;
      
            // Trigger the file download
            const filename = downloadURL.split("/").pop();
            const link = document.createElement("a");
            link.href = downloadURL;
            link.setAttribute("download", filename);  // Set the download attribute
            document.body.appendChild(link);
            link.click();
            link.remove();
          } else {
            console.error("No matching document found in the 'pdfs' collection.");
          }
        } catch (error) {
          console.error("Error fetching document for download:", error);
        }
      };

      const handleFileUpload = async (rowId) => {
        try {
          const userId = await fetchUserId(db, user.uid);
          const fileInput = document.createElement("input");
          fileInput.type = "file";
      
          fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
              const course = value.row.Course;
              const assignmentNo = value.row["Assignment No."];
      
              // Check if a document with the same user_id, course, and assignment no. exists
              const querySnapshot = await getDocs(
                query(
                  collection(db, "pdfs"),
                  where("userId", "==", userId),
                  where("course", "==", course),
                  where("assignmentNo", "==", assignmentNo)
                )
              );
      
              if (!querySnapshot.empty) {
                const existingDocId = querySnapshot.docs[0].id;
                const storageRef = ref(storage, `pdfs/${file.name}`);
                await uploadBytes(storageRef, file);
      
                // Update the existing document with the new storage URL and timestamp
                await updateDoc(doc(db, "pdfs", existingDocId), {
                  name: file.name,
                  url: await getDownloadURL(storageRef),
                  timestamp: serverTimestamp(),
                });
      
                // Fetch the updated timestamp from the document
                const updatedDoc = await getDoc(doc(db, "pdfs", existingDocId));
                const updatedTimestamp = updatedDoc.data().timestamp;
      
                // Update the due date in the row
                setRows((prevRows) => {
                  const updatedRows = prevRows.map((row) => {
                    if (row.id === rowId) {
                      return { ...row, "Due Date": updatedTimestamp };
                    }
                    return row;
                  });
                  return updatedRows;
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
                  userId: userId,
                  course: course,
                  assignmentNo: assignmentNo,
                  timestamp: timestamp,
                });
      
                // Fetch the timestamp from the newly created document
                const newDoc = await getDoc(newDocRef);
                const newTimestamp = newDoc.data().timestamp;
      
                // Update the due date in the row
                setRows((prevRows) => {
                  const updatedRows = prevRows.map((row) => {
                    if (row.id === rowId) {
                      return { ...row, "Due Date": newTimestamp };
                    }
                    return row;
                  });
                  return updatedRows;
                });
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
      
      

      return (
        <div>
          <IconButton onClick={ onDownload()}>
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
          const data = assignmentsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
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

export default TableLecturer;

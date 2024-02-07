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





const TableTest = ({ firebaseUser }) => {

  const PATH_URL_PDF = "http://localhost:5173/Week3 Assignment - Dor Shir.pdf";
  
  // const fetchUserId = async (db, userUid) => {
  //   try {
  //     // Query the 'users' collection where the 'id' field equals the user's UID
  //     const querySnapshot = await getDocs(
  //     query(collection(db, "users"), where("id", "==", userUid))
  //   );

  //   // If a document is found, return its document ID
  //   if (!querySnapshot.empty) {
  //     const userId = querySnapshot.docs[0].id;
  //     return userId;
  //   } else {
  //     // If no document is found, return null
  //     return null;
  //   }
  //   } catch (error) {
  //     console.error("Error fetching user ID from Firestore:", error);
  //     return null;
  //   }
  // };

  const columns = [
    { field: "Course", headerName: "Course", width: 130 },
    {
      field: "Assignment No.",
      headerName: "Assignment No.",
      width: 140,
      align: "center",
    },
    { field: "Checked By", headerName: "Checked By", width: 150 },
    {
      field: "Due Date",
      headerName: "Due Date",
      width: 440,
      valueFormatter: (params) => {
        // Convert timestamp to Date object
        const dueDate = params.value && params.value.toDate();

        // Format the Date object to a human-readable string
        return dueDate ? format(dueDate, "HH:mm:ss , dd-MM-yyyy") : "";
      },
    },
    { field: "Status", headerName: "Status", width: 110 },
    {
      field: "Actions",
      headerName: "Actions",
      width: 140,

      renderCell: (value) => {
        const isClickableDownload = value.row.Status !== null;
        const isClickableShow = value.row.Status !== "Checked";
        const isClickableUpload = value.row.Status !== "Checked";

        const onDownload = async () => {
          try {
            // const userId = await fetchUserId(db, user.uid);
            const course = value.row.Course;
            const assignmentNo = value.row["Assignment No."];
        
            // Query the "pdfs" collection based on course, assignmentNo, and userId
            const querySnapshot = await getDocs(
              query(
                collection(db, "pdfs"),
                where("course", "==", course),
                where("assignmentNo", "==", assignmentNo),
                where("userId", "==", firebaseUser.id)
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
            // const userId = await fetchUserId(db, user.uid);
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
                    where("userId", "==", firebaseUser.id),
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
                    userId: firebaseUser.id,
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
            <IconButton
              onClick={
                isClickableDownload
                  ? (event) => onDownload(PATH_URL_PDF)
                  : undefined
              }
              //disabled={!isClickableDownload}
            >
              <GetAppIcon />
            </IconButton>
            <IconButton
              onClick={() => handleFileUpload(value.row.id)}
              disabled={!isClickableUpload}
            >
              <UploadIcon />
            </IconButton>
            <IconButton disabled={!isClickableShow}>
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
        //TODO: this line is happend after login and refreshing the page (mabe its ok...) shachar
        if (!firebaseUser) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }
        // const userId = await fetchUserId(db, user.uid);
        console.log(firebaseUser.id);
        const assignmentsSnapshot = await getDocs(
          query(
            collection(db, "assignments"),
            where("Owner", "==", firebaseUser.id)
        )
        );

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
  }, [firebaseUser]);

  const handleUploadOpen = (rowId) => {
    setSelectedRowId(rowId);
    setUploadOpen(true);
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  return (
    <Box height={400} width={1300}>
      <img src='/src/logo/icheck_logo_1.png' alt="Logo" className="dashboard-logo"/>
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

export default TableTest;

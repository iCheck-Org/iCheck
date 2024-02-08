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
  const columns = [
    { field: "Course", headerName: "Course Name", width: 200 },
    {
      field: "Assignment No.",
      headerName: "Assignment No.",
      width: 150,
      align: "center",
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
    { field: "Status", headerName: "Status", width: 150 },
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
        const isClickableDownload = File_doc !== null && File_doc !== undefined;
        const isClickableShow = value.row.Status !== 'Unchecked';

        const onDownload = async (row) => {
          try {
            const userId = firebaseUser.id;
            const File_doc = row["File_doc"]; // Access the row object and get the value of "File_doc"
            console.log(File_doc);
            // Fetch all documents from the "pdfs" collection
            const querySnapshot = await getDocs(collection(db, "pdfs"));
            // Iterate through each document
            querySnapshot.forEach((doc) => {
              console.log(doc.id);
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
                  const updatedDoc = await getDoc(
                    doc(db, "pdfs", existingDocId)
                  );
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
              disabled={!isClickableShow}
              title = "View Review"
            >
              <VisibilityIcon />
            </IconButton>
            {showReviewView && (
              <ReviewView
                assignmentID={value.row.id}
                onClose={() => setShowReviewView(false)}
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
        //TODO: this line is happend after login and refreshing the page (mabe its ok...) shachar
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

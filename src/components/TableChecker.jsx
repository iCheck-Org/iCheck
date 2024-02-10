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
import GradingIcon from "@mui/icons-material/Grading";
import BackDropSample from "./BackDropSample";
import { format } from "date-fns";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../config/fire-base";
import Review from "./Review";

const TableChecker = ({ firebaseUser }) => {
  const columns = [
    { field: "personal_id", headerName: "Student ID", width: 130 },
    { field: "Course", headerName: "Course Name", width: 150 },
    {
      field: "Assignment No.",
      headerName: "Assignment No.",
      width: 150,
      align: "center",
    },
    {
      field: "Status",
      headerName: "Status",
      width: 200,
      renderCell: (params) => {
        const status = params.value;

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
      field: "submission_date",
      headerName: "Submission Date",
      width: 200,
      valueFormatter: (params) => {
        // Convert timestamp to Date object
        const dueDate = params.value && params.value.toDate();

        // Format the Date object to a human-readable string
        return dueDate ? format(dueDate, "dd/MM/yyyy, HH:mm:ss") : "";
      },
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
      field: "Actions",
      headerName: "Actions",
      width: 150,
      renderCell: (value) => {
        const File_doc = value.row["File_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["Due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate <= currentDate;

        const isClickableDownload =
          File_doc !== null &&
          File_doc !== undefined &&
          File_doc !== "" &&
          isPastDueDate;
        const isClickableShow = value.row.Status !== "Unchecked";

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

        const [showReview, setShowReview] = useState(false);
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
              onClick={() => setShowReview((prevState) => !prevState)}
              title="Grading Assignment"
            >
              <GradingIcon />
            </IconButton>
            {/* Pass assignmentId as a prop to the Review component */}
            {showReview && (
              <Review
                assignmentID={value.row.id}
                onClose={() => setShowReview(false)}
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

        // Fetch user ID
        const userId = firebaseUser.id;

        // Fetch user document
        const userDoc = await getDoc(doc(db, "users", userId));

        if (!userDoc.exists()) {
          console.log("User document does not exist.");
          return;
        }

        const userData = userDoc.data();
        const userCourses = userData.courses || [];

        // Fetch assignments that match the user's courses
        const assignmentsSnapshot = await getDocs(
          query(
            collection(db, "assignments"),
            where("Course-ref", "in", userCourses)
          )
        );

        // Map the fetched assignments data
        const rows = await Promise.all(
          assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();

            // Fetch corresponding user document based on the 'Owner' field
            const userQuerySnapshot = await getDocs(
              query(
                collection(db, "users"),
                where("id", "==", assignmentData.Owner)
              )
            );

            // Check if a matching user document exists
            if (!userQuerySnapshot.empty) {
              // Get the student_id from the user document
              const studentId = userQuerySnapshot.docs[0].data().personal_id;

              const File_doc = assignmentData["File_doc"]; // Access the assignmentData object and get the value of "File_doc"

              // Fetch submission date from "pdfs" collection based on "File_doc"
              const pdfsQuerySnapshot = await getDocs(
                query(collection(db, "pdfs"))
              );

              // Check if a matching pdf document exists
              if (!pdfsQuerySnapshot.empty) {
                let submissionTimestamp;

                pdfsQuerySnapshot.forEach((pdfDoc) => {
                  // Compare the File_doc with the document ID
                  if (pdfDoc.id === File_doc) {
                    submissionTimestamp = pdfDoc.data().timestamp;
                  }
                });

                return {
                  id: doc.id,
                  ...assignmentData,
                  personal_id: studentId, // Add the Student_ID field to the assignment data
                  submission_date: submissionTimestamp, // Add the submission date to the assignment data
                };
              }
            }

            // If no matching user document found or no matching pdf document found, return assignment data without modifying
            return {
              id: doc.id,
              ...assignmentData,
            };
          })
        );

        setRows(rows);
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
    <Box height={400} width={1190}>
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

export default TableChecker;

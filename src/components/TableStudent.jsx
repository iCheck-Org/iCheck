import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop } from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import Tabs from "./Tabs/Tabs";
import AssignmentDownload from "./FileOperations/AssignmentDownload";
import AssignmentUpload from "./FileOperations/AssignmentUpload";

import "../pages/styles.css";
import Tooltip from "@mui/material/Tooltip";
import { db } from "../config/fire-base";
import { RingLoader } from "react-spinners";

const TableStudent = ({ firebaseUser }) => {
  const columns = [
    {
      field: "Course",
      headerName: "Course Name",
      width: 150,
      align: "left",
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
      width: 150,
      align: "left",
      flex: 1,
      valueFormatter: (params) => {
        // Convert timestamp to Date object
        const dueDate = params.value && params.value.toDate();

        // Format the Date object to a human-readable string
        return dueDate ? format(dueDate, "dd/MM/yyyy, HH:mm:ss") : "";
      },
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: 150,
      align: "left",
      flex: 1,

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
      field: "Grade",
      headerName: "Grade",
      width: 80,
      align: "center",

      renderCell: (params) => {
        let grade = params.value;

        let backgroundColor = "";
        if (grade >= 0 && grade <= 60) {
          backgroundColor = "#FFCDD2"; // Orange color when grade is below 60
        } else {
          backgroundColor = "#C8E6C9"; // Green color for other grade
        }

        return (
          <div style={{ backgroundColor, width: "50px", padding: "8px", borderRadius: "4px" }}>
            {grade}
          </div>
        );
      },
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: 150,
      align: "left",
      flex: 1,
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

        const [showTabs, setShowTabs] = useState(false);
        return (
          <div >
            <div style={{ display: "inline-block", marginRight: "8px" }}>
              <IconButton id="Download" disabled={!isClickableDownload}>
                <AssignmentDownload
                  row={value.row}
                  disabled={!isClickableDownload}
                />
              </IconButton>
            </div>

            <div style={{ display: "inline-block", marginRight: "8px" }}>
              <IconButton id="Upload" disabled={!isClickableUpload}>
                <AssignmentUpload
                  rowId={value.row.id}
                  disabled={!isClickableUpload}
                  onUploadSuccess={handleRowUpdate}
                />
              </IconButton>
            </div>

            <IconButton
              id="Review"
              onClick={() => {
                  setShowTabs((prevState) => !prevState);
              }}
              disabled={!isClickableShow}
            >
              <Tooltip title="View Review" followCursor>
                <VisibilityIcon />
              </Tooltip>
            </IconButton>
            {showTabs && (
              <Tabs
                assignment={value.row}
                onClose={() => setShowTabs((prevState) => !prevState)}
                typePermision={firebaseUser.type}
                onSuccessAppeal={handleRowUpdate}
              />
            )}
          </div>
        );
      },
    },
  ];

  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!firebaseUser) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }

        const assignmentsSnapshot = await getDocs(
          query(collection(db, "assignments"), where("Owner", "==", firebaseUser.id))
        );

        const data = await Promise.all(
          assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();
            const courseName = assignmentData.Course_name;
            const submissionTimestamp = assignmentData.submissionDate;
            const grade = assignmentData.Grade;

            // Return the assignment data along with the course name
            return {
              id: doc.id,
              ...assignmentData,
              Course: courseName,
              submission_date: submissionTimestamp,
              Grade: grade,
            };
          })
        );

        setRows(data);
        setIsLoading(false); // Set loading to false when data fetching is completed
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

  const fetchUpdatedRowDataFromFirebase = async (updatedRowId) => {
    try {
      // Get the document snapshot for the updated row from Firestore
      const assignmentDoc = await getDoc(doc(db, "assignments", updatedRowId));

      // Check if the document exists
      if (assignmentDoc.exists()) {
        // Extract the data from the document
        const assignmentData = assignmentDoc.data();

        // Construct the updated row object
        const updatedRow = {
          id: updatedRowId,
          ...assignmentData,
          Course: assignmentData.Course_name, // Assuming Course_name is the correct field name
        };

        // Return the updated row
        return updatedRow;
      } else {
        console.error("Document does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error fetching updated row data from Firestore:", error);
      return null;
    }
  };

  const handleRowUpdate = async (updatedRowId) => {
    try {
      // Fetch the updated row data from Firebase based on the updatedRowId
      const updatedRow = await fetchUpdatedRowDataFromFirebase(updatedRowId);

      // Update the rows state with the fetched data
      if (updatedRow) {
        setRows((prevRows) => {
          // Find the index of the updated row in the rows array
          const rowIndex = prevRows.findIndex((row) => row.id === updatedRowId);

          // Replace the updated row at the corresponding index
          if (rowIndex !== -1) {
            const updatedRows = [...prevRows];
            updatedRows[rowIndex] = updatedRow;
            return updatedRows;
          } else {
            console.error("Row not found in rows state");
            return prevRows;
          }
        });
      }
    } catch (error) {
      console.error("Error handling row update:", error);
    }
  };

  return (
    <Box height={500} width={1190} style={{ position: "relative" }}>
      {/* Render loading indicator */}
      {isLoading && (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <RingLoader color="#36d7b7" />
        </Backdrop>
      )}

      {/* Render DataGrid when not loading */}
      {!isLoading && (
        <div style={{ height: "100%", width: "100%" }} className="table">
          <DataGrid
            autoHeight
            initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
            pageSizeOptions={[8, 16, 32]}
            columns={columns.map((column) => ({ ...column }))}
            rows={rows}
            slots={{ toolbar: GridToolbar }}
          />
        </div>
      )}

      {/* Render upload modal */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadOpen}
        onClick={handleUploadClose}
      ></Backdrop>
    </Box>
  );
};

export default TableStudent;

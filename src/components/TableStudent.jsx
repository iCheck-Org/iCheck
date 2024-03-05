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
import { format, set } from "date-fns";
import Tabs from "./Tabs/Tabs";
import AssignmentDownload from "./FileOperations/AssignmentDownload";
import AssignmentUpload from "./FileOperations/AssignmentUpload";

import "../pages/styles.css";
import Tooltip from "@mui/material/Tooltip";
import { db } from "../config/fire-base";
import { RingLoader } from "react-spinners";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import AppWidgetSummary from './MuiComponents/app-widget-summary';
import { calculateAverageGrade, calculateOpenAssignments, calculateAppealRequests} from "./CalculationFunc/StudentsCalc.jsx";

const TableStudent = ({ firebaseUser }) => {
  const columns = [
    {
      field: "course_name",
      headerName: "Course Name",
      width: 150,
      align: "left",
    },
    {
      field: "assignment No.",
      headerName: "Assignment No.",
      width: 150,
      align: "left",
    },
    {
      field: "due Date",
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
      field: "checker",
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
      field: "grade",
      headerName: "Grade",
      width: 80,
      align: "center",

      renderCell: (params) => {
        let grade = params.value;

        let backgroundColor = "";
        if (grade && grade >= 0 && grade <= 60) {
          backgroundColor = "#FFCDD2"; // Orange color when grade is below 60
        }
        else if (grade && grade > 60 && grade <= 100) {
          backgroundColor = "#C8E6C9"; // Green color for other grade
        }

        return (
          <div
            style={{
              backgroundColor,
              width: "50px",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            {grade}
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "left",
      flex: 1,
      renderCell: (value) => {
        const File_doc = value.row["File_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate >= currentDate;

        // Logic for displaying the icon buttons and enabling the functionality
        const isClickableUpload = isPastDueDate;
        const isClickableDownload =
          File_doc !== null && File_doc !== undefined && File_doc !== "";
        const isClickableShow = value.row.grade !== "";

        const [showTabs, setShowTabs] = useState(false);
        return (
          <div>
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
  const [averageGrade, setAverageGrade] = useState(0);
  const [openAppealRequestsCount, setopenAppealRequestsCount] = useState(0);
  const [{ totalAssignmentsCount, openAssignmentsCount }, setAssignmentsCounts] = useState({
    totalAssignmentsCount: 0,
    openAssignmentsCount: 0,
  });

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
            where("owner", "==", firebaseUser.id)
          )
        );
        
        // Calculate average grade
        const averageGrade = calculateAverageGrade(assignmentsSnapshot);
        setAverageGrade(averageGrade);
        // Calculate open assignments count
        const { openAssignmentsCount, totalAssignmentsCount } = calculateOpenAssignments(assignmentsSnapshot);
        setAssignmentsCounts({ openAssignmentsCount, totalAssignmentsCount });
        // Calculate open appeal requests count
        const openAppealRequestsCount = calculateAppealRequests(assignmentsSnapshot);
        setopenAppealRequestsCount(openAppealRequestsCount);

        const data = await Promise.all(
          assignmentsSnapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();
            const courseName = assignmentData.course_name;
            const submissionTimestamp = assignmentData.submissionDate;
            const grade = assignmentData.grade;

            // Return the assignment data along with the course name
            return {
              id: doc.id,
              ...assignmentData,
              Course: courseName,
              submission_date: submissionTimestamp,
              grade: grade,
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
          Course: assignmentData.course_name, // Assuming Course_name is the correct field name
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
    <Container maxWidth="xl">
      <div style={{ height: '50px' }}></div>
      <Grid container spacing={3} marginLeft={6}>
      {!isLoading && (
    <Grid container spacing={3} marginLeft={6}>
      <Grid xs={12} sm={6} md={3}>
        <AppWidgetSummary
          title="Average Grade"
          total={averageGrade}
          color="#C8E6C9"
          icon={<img alt="icon" src="/src/logo/wired-flat-2237-champagne-flutes.png"/>}
        />
      </Grid>
      <Grid xs={12} sm={6} md={3}>
        <AppWidgetSummary
          title="Open Assignments"
          total={openAssignmentsCount}
          color="#FFCDD2"
          icon={<img alt="icon" src="/src/logo/icons8-pen-50.png" />}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <AppWidgetSummary
          title="Open Appeals"
          total={openAppealRequestsCount}
          color="#f6efb7"
          icon={<img alt="icon" src="/src/logo/icons8-edit-50.png" />}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <AppWidgetSummary
          title="Total Assignments"
          total={totalAssignmentsCount}
          color="#ffc79f"
          icon={<img alt="icon" src="/src/logo/wired-flat-1947-aztec-pyramid.gif" />}
        />
      </Grid>
    </Grid>
  )}
        </Grid>
    <br />
    <Box height={500} width={1190} style={{ position: "relative" }}>
      {/* Render loading indicator */}
      {isLoading && (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <RingLoader color="#36d7b7" />
        </Backdrop>
      )}

      {/* Render DataGrid when not loading */}
      {!isLoading && (
        <div style={{ width: "100%" }} className="table">
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
    </Container>
  );
};

export default TableStudent;

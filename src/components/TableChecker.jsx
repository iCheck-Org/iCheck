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
import GradingIcon from "@mui/icons-material/Grading";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { format } from "date-fns";
import { db } from "../config/fire-base";
import WriteReview from "./Review/WriteReview";
import Tabs from "./Tabs/Tabs";
import AlertSnackbar from "./MuiComponents/AlertSnackbar";
import AssignmentDownload from "./FileOperations/AssignmentDownload";
import Tooltip from "@mui/material/Tooltip";
import { RingLoader } from "react-spinners";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import AppWidgetSummary from './MuiComponents/app-widget-summary';
import { calculateOpenAssignments } from "./CalculationFunc/CheckerCalc";

const TableChecker = ({ firebaseUser }) => {
  const [fileDownloaded, setFileDownloadedSuccessfuly] = useState(false);

  const columns = [
    {
      field: "personal_id",
      headerName: "Student ID",
      width: 150,
      align: "left",
    },
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
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "left",
      renderCell: (value) => {
        const File_doc = value.row["file_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate <= currentDate;
        const grade = value.row["grade"];

        const isClickableDownload =
          File_doc !== null &&
          File_doc !== undefined &&
          File_doc !== "" &&
          isPastDueDate;
        const isClickableGrading =
          isPastDueDate && grade === "" && File_doc !== "";
        const isClickableShow =
          grade !== null && grade !== undefined && grade !== "";

        const [showTabs, setShowTabs] = useState(false);
        const [showWriteReview, setShowWriteReview] = useState(false);
        return (
          <div>
            <IconButton
              id="Download"
              style={{ height: "100%" }} // Set the height of the IconButton container
              disabled={!isClickableDownload}
            >
              <Tooltip title="Download Assignment" followCursor>
                <AssignmentDownload
                  row={value.row}
                  disabled={!isClickableDownload}
                />
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={() => setShowWriteReview((prevState) => !prevState)}
              disabled={!isClickableGrading}
            >
              <Tooltip title="Write Review" followCursor>
                <GradingIcon />
              </Tooltip>
            </IconButton>

            <IconButton
              onClick={() => {
                console.log(value.row.id),
                  setShowTabs((prevState) => !prevState);
              }}
              disabled={!isClickableShow}
            >
              <Tooltip title="Show Review" followCursor>
                <VisibilityIcon />
              </Tooltip>
            </IconButton>

            {/* Pass assignmentId as a prop to the Review component */}
            {showWriteReview && (
              <WriteReview
                assignment={value.row}
                onClose={() => {
                  setShowWriteReview(false);
                }}
                firebaseUser={firebaseUser}
                onSuccessGrade={handleRowUpdate}
              />
            )}
            {showTabs && (
              <Tabs
                assignment={value.row}
                onClose={() => {
                  setShowTabs((prevState) => !prevState);
                }}
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
  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const [{ unCheckedAssignmentCount, checkedAssignmentCount }, setAssignmentsCounts] = useState({
    unCheckedAssignmentCount: 0,
    checkedAssignmentCount: 0,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!firebaseUser) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }
    
        const userCourses = firebaseUser.courses || [];
    
        // Fetch assignments that match the user's courses
        const assignmentsSnapshot = await getDocs(
          query(
            collection(db, "assignments"),
            where("course-ref", "in", userCourses)
          )
        );
    
        // Filter assignments based on conditions
        const filteredAssignments = assignmentsSnapshot.docs
          .filter((doc) =>
            doc.data()["due Date"].toDate() < new Date() &&
            (doc.data().Checker === firebaseUser.name || doc.data().Checker === "")
          );
        const { unCheckedAssignmentCount, checkedAssignmentCount } = calculateOpenAssignments(filteredAssignments);
        // Map the fetched assignments data
        const rows = await Promise.all(
          filteredAssignments.map(async (doc) => {
            
            const assignmentData = doc.data();
            const courseName = assignmentData.course_name;
            
    
            // Get the student_id from the user document
            const studentId = assignmentData.student_id;
    
            const submissionTimestamp = assignmentData.submissionDate;
            
            // If no matching user document found or no matching pdf document found, return assignment data without modifying
            return {
              id: doc.id,
              ...assignmentData,
              Course: courseName,
              personal_id: studentId,
              submission_date: submissionTimestamp,
            };
          })
        );
    
        setAssignmentsCounts({ unCheckedAssignmentCount, checkedAssignmentCount });
        setRows(rows);
        setIsLoading(false); // Data fetching complete, set loading to false
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
        setIsLoading(false); // Set loading to false in case of error
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
        const courseName = assignmentData.course_name;

        // Get the student_id from the user document
        const studentId = assignmentData.student_id;

        const submissionTimestamp = assignmentData.submissionDate;

        // Construct the updated row object
        const updatedRow = {
          id: updatedRowId,
          ...assignmentData,
          Course: courseName,
          personal_id: studentId,
          submission_date: submissionTimestamp,
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
      <div style={{ height: '40px' }}></div>
        <Grid container spacing={3} marginLeft={6}>
            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Open assignments"
                total={unCheckedAssignmentCount}
                color="#FFCDD2"
                icon={<img alt="icon" src="/src/logo/icons8-pen-50.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Close assignments"
                total={checkedAssignmentCount}
                color="#ffc79f"
                icon={<img alt="icon" src="/src/logo/wired-flat-1947-aztec-pyramid.gif" />}
              />
            </Grid>
          </Grid>
      <br />
      <Box height={500} width={1190}>
        {isLoading ? ( // Display loading indicator while data is being fetched
          <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <RingLoader color="#36d7b7" />
          </Backdrop>
        ) : (
          <div style={{ width: "100%" }} className="table">
            <DataGrid
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 8 } },
              }}
              pageSizeOptions={[8, 16, 32]}
              columns={columns.map((column) => ({
                ...column,
              }))}
              rows={rows}
              slots={{
                toolbar: GridToolbar,
              }}
            />
          </div>
        )}
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
    </Container>
  );
};

export default TableChecker;

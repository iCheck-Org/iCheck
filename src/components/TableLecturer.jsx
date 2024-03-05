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
import PreviewIcon from "@mui/icons-material/Preview";
import GradingIcon from "@mui/icons-material/Grading";
import { format } from "date-fns";
import { db } from "../config/fire-base";
import CreateAssignment from "./CreateAssignment";
import WriteReview from "./Review/WriteReview";
import SwitchAppeal from "./MuiComponents/SwitchAppeal";
import AssignmentDownload from "./FileOperations/AssignmentDownload";
import "../pages/styles.css";
import AlertSnackbar from "./MuiComponents/AlertSnackbar";
import Tabs from "./Tabs/Tabs";
import Tooltip from "@mui/material/Tooltip";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { RingLoader } from "react-spinners";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import AppWidgetSummary from "./MuiComponents/app-widget-summary";
import {
  calculateAverageGrade,
  calculateOpenAssignments,
} from "./CalculationFunc/LecturerCalc.jsx";

const TableLecturer = ({ firebaseUser }) => {
  const [fileDownloaded, setFileDownloadedSuccessfuly] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showAppealTable, setShowAppealTable] = useState(false);
  const [assignmentsSnapshot, setAssignmentsSnapshot] = useState([]);

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
      flex: 1,
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
        const appeal = value.row["appealAns"];

        // disable the buttons if the file is not uploaded
        const isClickableDownload =
          File_doc !== null &&
          File_doc !== undefined &&
          File_doc !== "" &&
          isPastDueDate;
        const isClickableGrading =
          isPastDueDate && grade === "" && File_doc !== "";
        const isClickableShow =
          grade !== null && grade !== undefined && grade !== "";

        const isAppeal = appeal !== null && appeal !== undefined;

        const [showReview, setShowReview] = useState(false);
        const [showWriteReview, setShowWriteReview] = useState(false);
        const [showAppeal, setShowAppeal] = useState(false);
        return (
          <div>
            <IconButton
              id="Download"
              style={{ height: "100%" }}
              disabled={!isClickableDownload}
            >
              <Tooltip title="Download Assignment" followCursor>
                <AssignmentDownload
                  row={value.row}
                  disabled={!isClickableDownload}
                />
              </Tooltip>
            </IconButton>

            {showAppealTable ? (
              <IconButton
                id="ShowAppeal"
                onClick={() => {
                  setShowAppeal(true);
                }}
                disabled={!isClickableShow}
              >
                <Tooltip title="Show Appeal" followCursor>
                  <span style={{ position: "relative", display: "flex" }}>
                    <RateReviewIcon />
                    <span
                      style={{
                        position: "absolute",
                        top: "22px",
                        left: "9px",
                        width: "7px",
                        height: "7px",
                        backgroundColor: isAppeal ? "green" : "orange",
                        borderRadius: "50%",
                      }}
                    />
                  </span>
                </Tooltip>
              </IconButton>
            ) : (
              <>
                <IconButton
                  onClick={() => setShowWriteReview((prevState) => !prevState)}
                  disabled={!isClickableGrading}
                >
                  <Tooltip title="Write Review" followCursor>
                    <GradingIcon />
                  </Tooltip>
                </IconButton>

                <IconButton
                  onClick={() => setShowReview((prevState) => !prevState)}
                  disabled={!isClickableShow}
                >
                  <Tooltip title="Show Review" followCursor>
                    <PreviewIcon />
                  </Tooltip>
                </IconButton>
              </>
            )}

            {showAppeal && (
              <Tabs
                assignment={value.row}
                typePermision={firebaseUser.type}
                onClose={() => setShowAppeal(false)}
                onSuccessGrade={handleRowUpdate}
              />
            )}

            {showWriteReview && (
              <WriteReview
                assignment={value.row}
                onClose={() => setShowWriteReview(false)}
                firebaseUser={firebaseUser}
                onSuccessGrade={handleRowUpdate}
              />
            )}

            {showReview && (
              <Tabs
                assignment={value.row}
                typePermision={"checker"}
                onClose={() => setShowReview(false)}
              />
            )}
          </div>
        );
      },
    },
  ];

  const [isLoading, setIsLoading] = useState(true); // State to track loading status
  const [amountOfLecturerCourses, setAmountOfLecturerCourses] = useState(0);
  const [averageGrade, setAverageGrade] = useState(0);
  const [totalAppeals, settotalAppeals] = useState(0);
  const [openAssignmentsCount, setOpenAssignmentsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!firebaseUser) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }

        const LecturerCourses = firebaseUser.courses;
        let snapshot = assignmentsSnapshot;

        // Fetch assignments only if assignmentsSnapshot is not available
        if (assignmentsSnapshot && assignmentsSnapshot.length == 0) {
          snapshot = await getDocs(
            query(
              collection(db, "assignments"),
              where("course-ref", "in", LecturerCourses)
            )
          );
          setAssignmentsSnapshot(snapshot);
        }

        // Filter assignments based on the showAppealTable flag
        if (showAppealTable) {
          let docs = assignmentsSnapshot.docs.filter(
            (doc) => doc.data().appeal
          );
          snapshot = { ...snapshot, docs };
        }

        // Map the fetched assignments data
        const rows = await Promise.all(
          snapshot.docs.map(async (doc) => {
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

        // Set the amount of lecturer courses for widget
        setAmountOfLecturerCourses(LecturerCourses.length);
        // Calculate average grade for widget
        const averageGrade = calculateAverageGrade(assignmentsSnapshot);
        setAverageGrade(averageGrade);
        // Calculate total number of appeals for widget
        settotalAppeals(
          assignmentsSnapshot.docs.filter((doc) => doc.data().appeal).length
        );
        // Calculate number of open assignments for widget
        const openAssignmants = calculateOpenAssignments(assignmentsSnapshot);
        setOpenAssignmentsCount(openAssignmants);

        setRows(rows);
        setIsLoading(false); // Set loading to false when data fetching is completed
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data from Firestore:", error);
      }
    };

    console.log("Starting data fetching process...");
    fetchData();
  }, [firebaseUser, showAppealTable, assignmentsSnapshot]);

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
    <>
      {isLoading ? (
        <Backdrop
          open={true}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <RingLoader color="#36d7b7" />
        </Backdrop>
      ) : (
        <Container maxWidth="xl">
          <div style={{ height: "60px" }}></div>
          <Grid container spacing={0.5} marginLeft={6}>
            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Avarage Grades"
                total={averageGrade}
                color="#C8E6C9"
                icon={
                  <img
                    alt="icon"
                    src="/src/logo/wired-flat-2237-champagne-flutes.png"
                  />
                }
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Total Appeals"
                total={totalAppeals}
                color="#FFCDD2"
                icon={<img alt="icon" src="/src/logo/icons8-pen-50.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Open Assignments"
                total={openAssignmentsCount}
                color="#f6efb7"
                icon={<img alt="icon" src="/src/logo/icons8-edit-50.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Open Courses"
                total={amountOfLecturerCourses}
                color="#ffc79f"
                icon={
                  <img
                    alt="icon"
                    src="/src/logo/wired-flat-1947-aztec-pyramid.gif"
                  />
                }
              />
            </Grid>
          </Grid>
          <div>
            {/* CreateAssignment button */}
            <button
              className="upload-assigment-button"
              onClick={() => setShowCreateAssignment((prevState) => !prevState)}
            >
              <Tooltip>Create Assignment</Tooltip>
            </button>

            <Box height={500} width={1190} position="relative">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 1, // Ensure it's above the DataGrid
                }}
              >
                <SwitchAppeal onToggle={setShowAppealTable} />
              </Box>

              {/* Conditionally render the CreateAssignment component */}
              {showCreateAssignment && (
                <CreateAssignment
                  firebaseUser={firebaseUser}
                  onClose={() => setShowCreateAssignment(false)}
                />
              )}

              {/* DataGrid component */}
              <div
                style={{ width: "100%", marginTop: "30px" }}
                className="table"
              >
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

              {/* Snackbar and Backdrop components */}
              <AlertSnackbar
                open={fileDownloaded}
                setOpen={setFileDownloadedSuccessfuly}
                severity="success"
                message="File was downloaded successfully"
              />
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={uploadOpen}
                onClick={handleUploadClose}
              ></Backdrop>
            </Box>
          </div>
        </Container>
      )}
    </>
  );
};

export default TableLecturer;

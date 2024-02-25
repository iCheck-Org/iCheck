import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import GetAppIcon from "@mui/icons-material/GetApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GradingIcon from "@mui/icons-material/Grading";
import { format } from "date-fns";
import { db } from "../config/Fire-base";
import CreateAssignment from "./CreateAssignment";
import WriteReview from "./Review/WriteReview";
import SwitchAppeal from "./MuiComponents/SwitchAppeal";
import { handleFileDownload } from "./FileOperations/AssignmentDownload";
import '../pages/styles.css';
import AlertSnackbar from "./MuiComponents/AlertSnackbar";
import Tabs from "./Tabs/Tabs";

const TableLecturer = ({ firebaseUser }) => {
  const [fileDownloaded, setFileDownloadedSuccessfuly] = useState(false);

  const columns = [
    { 
      field: "personal_id",
      headerName: "Student ID",
      width: 130,
      align: "left"
    },
    { field: "Course",
      headerName: "Course Name",
      width: 150,
      align: "left"
    },
    {
      field: "Assignment No.",
      headerName: "Assignment No.",
      width: 150,
      align: "left",
    },
    {
      field: "submission_date",
      headerName: "Submission Date",
      width: 200,
      align: "left",
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
      align: "left",
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
      field: "Actions",
      headerName: "Actions",
      width: 200,
      align: "left",
      renderCell: (value) => {
        

        const File_doc = value.row["File_doc"]; // Access the row object and get the value of "File_doc"
        const currentDate = new Date().getTime(); // Get current timestamp
        const dueDateTimestamp = value.row["Due Date"].toDate(); // Convert Firestore timestamp to JavaScript Date object
        const dueDate = dueDateTimestamp.getTime(); // Get timestamp from JavaScript Date object
        const isPastDueDate = dueDate <= currentDate;
        const grade = value.row["Grade"];

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

      const [showReview, setShowReview] = useState(false);
      const [showWriteReview, setShowWriteReview] = useState(false);
      const [showAppeal, setShowAppeal] = useState(false);
        return (
          <div>
            <IconButton
              onClick={() => handleFileDownload(value.row , firebaseUser)}
              disabled={!isClickableDownload}
              title="Download Assignment"
            >
              <GetAppIcon />
            </IconButton>

            {/* Conditionally render the visibility icon */}
            {showAppealTable ? (
              <IconButton
                onClick={() => setShowAppeal((prevState) => !prevState)}
                disabled={!isClickableShow}
                title="View Review"
              >
                <VisibilityIcon />
              </IconButton>
            ) : (
              <>
                <IconButton
                  onClick={() => setShowWriteReview((prevState) => !prevState)}
                  disabled={!isClickableGrading}
                  title="Grading Assignment"
                >
                  <GradingIcon />
                </IconButton>

                <IconButton
                  onClick={() => setShowReview((prevState) => !prevState)}
                  disabled={!isClickableShow}
                  title="View Review"
                >
                  <VisibilityIcon />
                </IconButton>
              </>
            )}

            {showAppeal && (
              <Tabs
                assignment={value.row}
                typePermision={firebaseUser.type}
                onClose={() => setShowAppeal(false)}
              />
            )}

            {showWriteReview && (
              <WriteReview
                assignment={value.row}
                onClose={() => setShowWriteReview(false)}
                firebaseUser={firebaseUser}
              />
            )}

            {showReview && (
              <WriteReview
                assignment={value.row}
                onClose={() => setShowReview(false)}
                firebaseUser={firebaseUser}
              />
            )}
          </div>
        );
      },
    },
  ];

  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [showAppealTable, setShowAppealTable] = useState(false);
  const [assignmentsSnapshot, setAssignmentsSnapshot] = useState([]);

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
              where("Course-ref", "in", LecturerCourses)
            )
          );
          setAssignmentsSnapshot(snapshot);
        }

        // Filter assignments based on the showAppealTable flag
        if (showAppealTable) {
          let docs = assignmentsSnapshot.docs.filter(
            (doc) => doc.data().Appeal
          );
          snapshot = { ...snapshot, docs };
        }

        // Map the fetched assignments data
        const rows = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const assignmentData = doc.data();

              const courseName = assignmentData.Course_name;

              // Get the student_id from the user document
              const studentId = assignmentData.Student_id;

              const submissionTimestamp = assignmentData.submissionDate;
              // If no matching user document found or no matching pdf document found, return assignment data without modifying
              return {
                id: doc.id,
                ...assignmentData,
                Course: courseName,
                personal_id : studentId,
                submission_date: submissionTimestamp,
              };
            // }
          })
        );

        setRows(rows);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    console.log("Starting data fetching process...");
    fetchData();
  }, [firebaseUser, showAppealTable, assignmentsSnapshot]);

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  return (
    <Box height={500} width={1190}>
      <Box height={80} width={1190}>
        {/* Use a function to toggle the state */}
        <button
          className="upload-assigment-button"
          onClick={() => setShowCreateAssignment((prevState) => !prevState)}
        >
          Upload Assignment
        </button>
      </Box>

      {/* Conditionally render the CreateAssignment component */}
      {showCreateAssignment && (
        <CreateAssignment
          firebaseUser={firebaseUser}
          onClose={() => setShowCreateAssignment(false)}
        />
      )}
      <Box display="flex" justifyContent="flex-end" height={40} style={{ marginTop: "-4%" }}>
          <SwitchAppeal onToggle={setShowAppealTable} />
      </Box>

      <div style={{ height: "105%", width: "100%"}}>
        <DataGrid columns={columns} rows={rows} />
      </div>

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
  );
};

export default TableLecturer;

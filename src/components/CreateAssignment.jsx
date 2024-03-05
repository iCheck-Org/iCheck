import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { styled, css } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import { Box, Tooltip } from "@mui/material";
import { collection, doc, addDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/fire-base";
import "animate.css";
import "../pages/styles.css";

export default function CreateAssignment({ firebaseUser, onClose }) {
  const [open, setOpen] = useState(true);
  const [courseOptions, setCourseOptions] = useState([]); // State to store course options
  const [selectedCourse, setSelectedCourse] = useState(""); // State to store the selected course
  const [assignmentNo, setAssignmentNo] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const fetchCourseOptions = async () => {
      try {
        if (firebaseUser) {
          const userData = firebaseUser;

          // Array to store promises for fetching course names
          const fetchCoursePromises = [];

          // Iterate through the user's courses and fetch course names
          userData.courses.forEach((courseId) => {
            const courseDocRef = doc(db, "courses-test", courseId);
            const coursePromise = getDoc(courseDocRef).then(
              (courseDocSnapshot) => {
                if (courseDocSnapshot.exists()) {
                  const courseData = courseDocSnapshot.data();
                  return { id: courseId, name: courseData.name };
                } else {
                  return null;
                }
              }
            );
            fetchCoursePromises.push(coursePromise);
          });

          // Wait for all promises to resolve
          const courses = await Promise.all(fetchCoursePromises);
          // Filter out any null values and set the course options in state
          const userCourseOptions = courses.filter((course) => course !== null);
          setCourseOptions(userCourseOptions);
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error fetching course options:", error);
      }
    };

    fetchCourseOptions();
  }, [firebaseUser]);

  const handleClose = () => {
    setOpen(false);
    onClose(); // Call the onClose function passed from the parent component
  };

  const handleSelectChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleCreateAssignment = async () => {
    try {
      const courseDocRef = doc(db, "courses-test", selectedCourse);
      const courseDocSnapshot = await getDoc(courseDocRef);

      if (courseDocSnapshot.exists()) {
        const courseData = courseDocSnapshot.data();

        // Create an assignment for each student in the course
        await Promise.all(
          courseData.students.map(async (student) => {
            const studentDocRef = doc(db, "users", student);
            const studentDocSnap = await getDoc(studentDocRef);

            if (!studentDocSnap.empty) {
              const studentData = studentDocSnap.data();
              console.log(studentData.personal_id);
              const studentID = studentData.personal_id; // Set studentID here

              const assignmentData = {
                Owner: student,
                "Assignment No.": assignmentNo,
                // Convert dueDate to a Firestore Timestamp
                "Due Date": Timestamp.fromDate(new Date(dueDate)),
                Checker: "",
                Grade: "",
                File_doc: "",
                "Course-ref": selectedCourse,
                Course_name: courseData.name,
                Student_id: studentID, // Use studentID here
              };

              // Add the assignment document to the "assignments" collection
              await addDoc(collection(db, "assignments"), assignmentData);
            }
          })
        );

        // Close the modal after creating assignments
        handleClose();
      } else {
        console.error("Course document not found");
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
    }
  };

  return (
    <div>
      <BaseModal
        className={"modal" + " animate_animated animatezoomIn animate_faster"}
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        <div className="modal-content">
          <Box sx={{ marginTop: "10px" }} />

          <h2>Assignment Creation</h2>
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "row",
              gap: "72px",
            }}
          >
            <label htmlFor="assignmentNo">Course Name:</label>
            {/* Render course options as a select dropdown */}
            <select
              className="inputBox"
              onChange={handleSelectChange}
              value={selectedCourse}
            >
              <option value=""></option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </Box>
          {/* Box for Assignment No. */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: "17px" }}>
            <label htmlFor="assignmentNo">Assignment Number:</label>
            <input
              className="inputBox"
              type="text"
              id="assignmentNo"
              value={assignmentNo}
              onChange={(e) => setAssignmentNo(e.target.value)}
            />
          </Box>
          {/* Box for Due Date */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: "105px" }}>
            <label htmlFor="dueDate">Due Date:</label>
            <input
              className="inputBox"
              type="datetime-local"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Box>
          {/* Create button */}
          <button className="inputButton" onClick={handleCreateAssignment}>
            Create
          </button>
        </div>
      </BaseModal>
    </div>
  );
}

// Styles and PropTypes omitted for brevity
const Backdrop = React.forwardRef((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ "base-Backdrop-open": open }, className)}
      ref={ref}
      {...other}
    />
  );
});

Backdrop.propTypes = {
  className: PropTypes.string.isRequired,
  open: PropTypes.bool,
};

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

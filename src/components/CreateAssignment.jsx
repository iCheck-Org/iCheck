import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { styled } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import { Box } from "@mui/material";
import { collection, doc, addDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/fire-base";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import "animate.css";
import "../pages/styles.css";

export default function CreateAssignment({ firebaseUser, onClose }) {
  const [open, setOpen] = useState(true);
  const [courseOptions, setCourseOptions] = useState([]); // State to store course options
  const [selectedCourse, setSelectedCourse] = useState(""); // State to store the selected course
  const [assignmentNo, setAssignmentNo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef(null);

  const clickLoading = async () => {
    if (!loading) {
      setLoading(true);
      try {
        await handleCreateAssignment();
        // Delay setting success state to true by 500 milliseconds
        setTimeout(() => {
          setSuccess(true);
        }, 500);
      } catch (error) {
        console.error("Error creating assignments:", error);
        // Handle any errors here if needed
      }
      setLoading(false); // Set loading to false after assignment creation
      // Reset success state to false after a brief delay
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 700);
    }
  };
  
  

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const fetchCourseOptions = async () => {
      try {
        if (firebaseUser) {
          const userData = firebaseUser;

          const fetchCoursePromises = [];

          userData.courses.forEach((courseId) => {
            const courseDocRef = doc(db, "courses", courseId);
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

          const courses = await Promise.all(fetchCoursePromises);
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
    onClose();
  };

  const handleSelectChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleCreateAssignment = async () => {
    try {
      const courseDocRef = doc(db, "courses", selectedCourse);
      const courseDocSnapshot = await getDoc(courseDocRef);

      if (courseDocSnapshot.exists()) {
        const courseData = courseDocSnapshot.data();

        await Promise.all(
          courseData.students.map(async (student) => {
            const studentDocRef = doc(db, "users", student);
            const studentDocSnap = await getDoc(studentDocRef);

            if (!studentDocSnap.empty) {
              const studentData = studentDocSnap.data();
              const studentID = studentData.personal_id;

              const assignmentData = {
                owner: student,
                "assignment No.": assignmentNo,
                "due Date": Timestamp.fromDate(new Date(dueDate)),
                checker: "",
                grade: "",
                file_doc: "",
                "course-ref": selectedCourse,
                course_name: courseData.name,
                student_id: studentID,
              };

              await addDoc(collection(db, "assignments"), assignmentData);
            }
          })
        );

        setSuccess(true);
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
            <label htmlFor="assignmentNo" className="assignment-text">
              Course Name:
            </label>
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
          <Box sx={{ display: "flex", flexDirection: "row", gap: "28px" }}>
            <label htmlFor="assignmentNo" className="assignment-text">
              Assignment Number:
            </label>
            <input
              className="inputBox"
              type="text"
              id="assignmentNo"
              value={assignmentNo}
              onChange={(e) => setAssignmentNo(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", gap: "100px" }}>
            <label htmlFor="dueDate" className="assignment-text">
              Due Date:
            </label>
            <input
              className="inputBox"
              type="datetime-local"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Box>
          <div className="d-grid">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            ></Box>
            <Box sx={{ m: 1, position: "relative" }}>
            <button
              className={clsx("inputButton", { successButton: success })}
              onClick={clickLoading}
              style={{ position: 'relative' }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: green[700]}}/>
              ) : success ? (
                <CheckIcon />
              ) : (
                "Create"
              )}
            </button>

            </Box>
         </div>







        </div>
      </BaseModal>
    </div>
  );
}

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

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { styled, css } from "@mui/system";
import { Modal as BaseModal } from "@mui/base/Modal";
import { Box } from "@mui/material";
import TextBox from "../MuiComponents/TextBox";
import { db } from "../../config/fire-base";
import CircularProgress from "@mui/material/CircularProgress";
import { green } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

export default function WriteReview({
  assignment,
  onClose,
  firebaseUser,
  onSuccessGrade,
}) {
  const [open, setOpen] = useState(true);
  const [hasComment, setHasComment] = useState(false); // State to track if the assignment has a Comment
  const [gradeInputValue, setGradeInputValue] = useState(""); // Define state for grade input value
  const [commentInputValue, setCommentInputValue] = useState(""); // Define state for comment input value
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if ("comment" in assignment) {
      setHasComment(true);
      setCommentInputValue(assignment.comment);
    }
    if ("grade" in assignment) {
      setGradeInputValue(assignment.grade);
    }
  }, [assignment]);

  const handleClose = () => {
    setOpen(false);
    onClose(); // Call the onClose function passed from the parent component
  };

  const handleSubmit = async () => {
    try {
      // Get a reference to the Firestore document
      const documentRef = doc(db, "assignments", assignment.id);
      // Create an object with the grade and comment data
      const data = {
        grade: gradeInputValue,
        comment: commentInputValue,
        checker: `${firebaseUser.name}`,
      };

      // Use updateDoc() method to update the document with the new data
      await updateDoc(documentRef, data);

      console.log("Document successfully updated!");
      onSuccessGrade(assignment.id);
      setSuccess(true);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const clickLoading = async () => {
    if (!loading) {
      setLoading(true);
      try {
        await handleSubmit();
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

  return (
    <div>
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
        slots={{ backdrop: StyledBackdrop }}
      >
        {hasComment ? (
          <ModalContent
            sx={{
              width: 900,
              height: 500,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box width={700} height={500} sx={{ textAlign: "center" }}>
              <h2>Checker's Comment</h2>
              <TextBox value={commentInputValue} onChange={() => {}} />
              <div>Grade: {gradeInputValue}</div>
            </Box>
          </ModalContent>
        ) : (
          <ModalContent
            sx={{
              width: 900,
              height: 500,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box width={700} height={500} sx={{ textAlign: "center" }}>
              <h2>Review Assignment</h2>
              <TextBox
                value={commentInputValue}
                onChange={(event) => setCommentInputValue(event.target.value)}
              />
            </Box>
            <Box width={200} height={200} sx={{ textAlign: "center" }}>
              <input
                type="text"
                placeholder="Grade"
                style={{
                  width: "30%",
                  height: "50%",
                  textAlign: "start",
                  paddingLeft: "10px",
                }}
                value={gradeInputValue}
                onChange={(event) => setGradeInputValue(event.target.value)}
              />
            </Box>
            <Box width={200} height={500} sx={{ textAlign: "center" }}>
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
                "Submit"
              )}
            </button>
            </Box>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}

WriteReview.propTypes = {
  onClose: PropTypes.func.isRequired, // Define onClose prop as a function
};

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

const blue = {
  200: "#99CCFF",
  300: "#66B2FF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0066CC",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const Modal = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContent = styled("div")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === "dark" ? "rgb(0 0 0 / 0.5)" : "rgb(0 0 0 / 0.2)"};
    padding: 24px;
    color: ${theme.palette.mode === "dark" ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === "dark" ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `
);

const TriggerButton = styled("button")(
  ({ theme }) => css`
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
    color: ${theme.palette.mode === "dark" ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      background: ${theme.palette.mode === "dark" ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === "dark" ? grey[600] : grey[300]};
    }

    &:active {
      background: ${theme.palette.mode === "dark" ? grey[700] : grey[100]};
    }

    &:focus-visible {
      box-shadow: 0 0 0 4px
        ${theme.palette.mode === "dark" ? blue[300] : blue[200]};
      outline: none;
    }
  `
);

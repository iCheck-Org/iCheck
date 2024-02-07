import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, css } from '@mui/system';
import { Modal as BaseModal } from '@mui/base/Modal';
import { Box } from '@mui/material';
import { collection, doc, addDoc, getDocs, getDoc, arrayUnion , Timestamp } from "firebase/firestore";
import { db } from "../config/fire-base";

export default function CreateAssignment({ user, onClose }) {
    const [open, setOpen] = useState(true);
    const [courseOptions, setCourseOptions] = useState([]); // State to store course options
    const [selectedCourse, setSelectedCourse] = useState(''); // State to store the selected course
    const [assignmentNo, setAssignmentNo] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const fetchCourseOptions = async () => {
            try {
                // Get the user document from the "users" collection
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();

                    // Array to store promises for fetching course names
                    const fetchCoursePromises = [];

                    // Iterate through the user's courses and fetch course names
                    userData.courses.forEach(courseId => {
                        const courseDocRef = doc(db, 'courses-test', courseId);
                        const coursePromise = getDoc(courseDocRef).then(courseDocSnapshot => {
                            if (courseDocSnapshot.exists()) {
                                const courseData = courseDocSnapshot.data();
                                return { id: courseId, name: courseData.name };
                            } else {
                                return null;
                            }
                        });
                        fetchCoursePromises.push(coursePromise);
                    });

                    // Wait for all promises to resolve
                    const courses = await Promise.all(fetchCoursePromises);
                    // Filter out any null values and set the course options in state
                    const userCourseOptions = courses.filter(course => course !== null);
                    setCourseOptions(userCourseOptions);
                } else {
                    console.error("User document not found");
                }
            } catch (error) {
                console.error("Error fetching course options:", error);
            }
        };

        fetchCourseOptions();
    }, [user]);

    const handleClose = () => {
        setOpen(false);
        onClose(); // Call the onClose function passed from the parent component
    };

    const handleSelectChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    const handleCreateAssignment = async () => {
        try {
            const courseDocRef = doc(db, 'courses-test', selectedCourse);
            const courseDocSnapshot = await getDoc(courseDocRef);
    
            if (courseDocSnapshot.exists()) {
                const courseData = courseDocSnapshot.data();
    
                // Create an assignment for each student in the course
                courseData.students.forEach(async (student) => {
                    const assignmentData = {
                        Owner: student,
                        Course: courseData.name,
                        "Assignment No.": assignmentNo,
                        // Convert dueDate to a Firestore Timestamp
                        "Due Date": Timestamp.fromDate(new Date(dueDate)),
                        "Checked By": "-",
                        Status: "Unchecked",
                        "File Doc": "-",
                        "Course-ref": selectedCourse
                    };
    
                    // Add the assignment document to the "assignments" collection
                    await addDoc(collection(db, 'assignments'), assignmentData);
                });
    
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
            <Modal
                aria-labelledby="unstyled-modal-title"
                aria-describedby="unstyled-modal-description"
                open={open}
                onClose={handleClose}
                slots={{ backdrop: StyledBackdrop }}
            >
                <ModalContent sx={{ width: 1000, height: 600 }}>
                    <Box width={900} height={400} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', padding: '24px' }}>
                        <h2 style={{ textAlign: 'center' }}>Create assignment to students</h2>
                        <div style={{ marginTop: '30px' }} />
                        <h3 id="unstyled-modal-title" className="modal-title">
                            Choose course
                        </h3>
                        {/* Render course options as a select dropdown */}
                        <select onChange={handleSelectChange} value={selectedCourse}>
                            <option value="">Select a course</option>
                            {courseOptions.map(course => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                        {/* Box for Assignment No. */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                            <label htmlFor="assignmentNo">Assignment No.</label>
                            <input
                                type="text"
                                id="assignmentNo"
                                value={assignmentNo}
                                onChange={(e) => setAssignmentNo(e.target.value)}
                            />
                        </Box>
                        {/* Box for Due Date */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </Box>
                        {/* Create button */}
                        <button onClick={handleCreateAssignment}>Create</button>
                    </Box>
                </ModalContent>
            </Modal>
        </div>
    );
}



// Styles and PropTypes omitted for brevity


const Backdrop = React.forwardRef((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ 'base-Backdrop-open': open }, className)}
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
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
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

const ModalContent = styled('div')(
  ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 24px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === 'dark' ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `,
);

const TriggerButton = styled('button')(
  ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &:active {
      background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
    }

    &:focus-visible {
      box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
      outline: none;
    }
  `,
);
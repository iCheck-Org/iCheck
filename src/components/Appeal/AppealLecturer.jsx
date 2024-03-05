import React, { useState, useEffect } from 'react';
import { doc , updateDoc } from 'firebase/firestore';
import { db } from '../../config/fire-base';
import TextBox from '../MuiComponents/TextBox';
import { Box } from '@mui/material';
import ReactiveButton from 'reactive-button';


export default function AppealTabs({ assignment, onSuccessGrade }) {
  const [grade, setGrade] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [lecturerAnswer, setLecturerAnswer] = useState('');
  const [submitClicked, setSubmitClicked] = useState(false);

  useEffect(() => {
          setGrade(assignment.grade || ''); // Set the current grade from the Firestore document
  }, [assignment]);


  const handleSubmit = async () => {
    try {
      const assignmentDocRef = doc(db, 'assignments', assignment.id);
      await updateDoc(assignmentDocRef, {
        grade: newGrade, // Update the grade with the new value
        appealAns: lecturerAnswer
      });
      console.log('Document successfully updated!');
      
      // Update the local state 'grade' with the new value
      setGrade(newGrade);
      setSubmitClicked(true);
      onSuccessGrade(assignment.id);
  
      // Optionally, you can perform additional actions upon successful submission
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  return (
    <div>
      {/* TextBox for lecturer's answer */}
      <div style={{ marginBottom: '20px' }}>
        {!('appealAns' in assignment) ? (
          <TextBox 
            value={lecturerAnswer} 
            onChange={(event) => setLecturerAnswer(event.target.value)} 
          />
        ) : (
          <TextBox value={assignment.appealAns} onChange={() => {}} disabled />
        )}
      </div>
      
{/* Grade display */}
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}> {/* Reduced margin-bottom */}
  <Box display="flex" alignItems="center" justifyContent="center" width={150} height={50} sx={{ textAlign: "center" }}>
    <div style={{ marginRight: "15px" }}>
      <h4 style={{ margin: '0' }}>Grade:</h4> {/* Adjusted margin */}
    </div>
    <label 
      style={{ 
        backgroundColor: grade > 60 ? '#C8E6C9' : '#FFCDD2', // Background color based on grade
        width: "50px",
        padding: '4px', 
        borderRadius: '4px' 
      }}
    >
      {grade}
    </label>
  </Box>
</div>

{/* Input for new grade */}
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  {!('appealAns' in assignment) && !submitClicked && (
    <>
      <h4 style={{ margin: '0', marginRight: '10px' }}>New Grade:</h4> {/* Adjusted margin */}
      <input 
        type="text" 
        value={newGrade} 
        style={{ width: '5%', height: '20%', textAlign: 'start', paddingLeft: '10px', marginBottom: '0' }} 
        onChange={(event) => setNewGrade(event.target.value)}
      />
    </>
  )}
</div>
      {/* Submit button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginRight:'70px'}}>
        {!('appealAns' in assignment) && !submitClicked && (
          <button 
            type="button"
            className="inputButton"
            variant="contained"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
  
  
  }
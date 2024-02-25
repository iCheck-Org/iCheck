import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { doc , updateDoc } from 'firebase/firestore';
import { db } from '../../config/Fire-base';
import TextBox from '../MuiComponents/TextBox';


export default function AppealTabs({ assignment }) {
  const [grade, setGrade] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
          setGrade(assignment.Grade || ''); // Set the current grade from the Firestore document
  }, [assignment]);


  const handleSubmit = async () => {
    try {
      const assignmentDocRef = doc(db, 'assignments', assignment.id);
      await updateDoc(assignmentDocRef, {
        Grade: newGrade, // Update the grade with the new value
        AppealAns: userAnswer
      });
      console.log('Document successfully updated!');
      
      // Update the local state 'grade' with the new value
      setGrade(newGrade);
  
      // Optionally, you can perform additional actions upon successful submission
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  return (
      <div>
  <div style={{ marginBottom: '20px' }}> {/* Add margin bottom to create space */}
    <TextBox value={userAnswer} onChange={(event) => setUserAnswer(event.target.value)} />
  </div>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <div style={{ marginRight: '10px' }}>Current Grade:</div>
  <div>{grade}</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <div style={{ marginRight: '10px' }}>New Grade:</div>
  <input 
    type="text" 
    value={newGrade} 
    style={{ width: '5%', height: '20%', textAlign: 'start', paddingLeft: '10px' }} 
    onChange={(event) => setNewGrade(event.target.value)}
  />
</div>

  <button onClick={handleSubmit}>Submit</button>
</div>
  );
}

AppealTabs.propTypes = {
  assignment: PropTypes.object.isRequired,
};
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useState, useEffect } from 'react';
import { doc, getDoc , updateDoc } from 'firebase/firestore';
import { db } from '../config/fire-base';
import TextBox from './TextBox';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function AppealTabs({ assignmentID }) {
  const [value, setValue] = useState(0);
  const [studentAppeal, setStudentAppeal] = useState('');
  const [checkerComment, setCheckerComment] = useState('');
  const [grade, setGrade] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentDocRef = doc(db, 'assignments', assignmentID);
        const assignmentDocSnap = await getDoc(assignmentDocRef);
        if (assignmentDocSnap.exists()) {
          const data = assignmentDocSnap.data();
          setStudentAppeal(data.Appeal || '');
          setCheckerComment(data.Comment || '');
          setGrade(data.Grade || ''); // Set the current grade from the Firestore document
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [assignmentID]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = async () => {
    try {
      const assignmentDocRef = doc(db, 'assignments', assignmentID);
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
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Checker's comment"  {...a11yProps(0)} />
          <Tab label="Student's appeal" {...a11yProps(1)} />
          <Tab label="Your answer" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <TextBox value={checkerComment} onChange={() => {}} />
        <label>Grade: </label>
        <input
          type="text"
          style={{ width: '5%', height: '20%', textAlign: 'start', paddingLeft: '10px' }}
          value={grade}
          onChange={() => {}}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
  <div>
    <TextBox value={studentAppeal} onChange={() => {}} />
  </div>
</CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
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
</CustomTabPanel>
    </Box>
  );
}

AppealTabs.propTypes = {
  assignmentID: PropTypes.string.isRequired,
};
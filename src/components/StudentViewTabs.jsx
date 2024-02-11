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

  export default function StudentViewTabs({ assignmentID }) {
      const [comment, setComment] = useState('');
      const [grade, setGrade] = useState('');
      const [appealValue, setAppealValue] = useState(''); // Define state for appeal input value
      const [appealAnsValue, setAppealAnsValue] = useState(''); // Define state for appeal input value
      const [value, setValue] = useState(0); // Initialize value state
      const [appealFieldExists, setAppealFieldExists] = useState(false); // State to track if "Appeal" field exists
      const [appealAnsFieldExists, setAppealAnsFieldExists] = useState(false); // State to track if lecturer ans the appeal
      const [open, setOpen] = useState(true);

      useEffect(() => {
        const fetchData = async () => {
          try {
            const docRef = doc(db, 'assignments', assignmentID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setComment(data.Comment || '');
              setGrade(data.Grade || '');
      
              // Check if "Appeal" field exists
              if ('Appeal' in data) {
                setAppealFieldExists(true);
                setAppealValue(data.Appeal); // Set appealValue state to the value of "Appeal" field
              }
      
              // Check if "AppealAns" field exists
              if ('AppealAns' in data) {
                setAppealAnsFieldExists(true);
                setAppealAnsValue(data.AppealAns); // Set appealValue state to the value of "AppealAns" field
              } else {
                setAppealAnsFieldExists(false);
              }
      
              setOpen(true); // Update the state to open the modal after data fetching is complete
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
      
        fetchData();
      }, [assignmentID, appealValue, appealAnsValue]);
      
      const handleAppealSubmit = async () => {
        try {
          // Get a reference to the Firestore document
          const documentRef = doc(db, 'assignments', assignmentID);

          // Create an object with the grade and comment data
          const data = {
            Appeal: appealValue, // Assume appealValue is the value entered by the user in the appealTextBox input field
            AppealAns : appealAnsValue
          };
          
          // Use updateDoc() method to update the document with the new data
          await updateDoc(documentRef, data);
          console.log('Document successfully updated!');
          setOpen(false); // Close the modal after successful submission
          onClose(); // Call the onClose function passed from the parent component
          // if (!appealFieldExists) { // If "Appeal" field didn't exist before, set it to true
          //   setAppealFieldExists(true);
          // }
          // Reset appealValue after submission
          setAppealValue(''); // or setAppealValue(null);
          setAppealAnsValue('');
        } catch (error) {
          console.error('Error updating document: ', error);
        }
      };
    
      const handleChange = (event, newValue) => {
        setValue(newValue);
      };
    
      const handleAppealValue = (event) => {
        const { value } = event.target;
        setAppealValue(value);
      };
    
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Review Assignment" {...a11yProps(0)} />
              <Tab label="Appeal" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <Box width={700} height={250} sx={{ textAlign: 'center' }}>
              <h2>Checker's Comment</h2>
              <TextBox value={comment} onChange={() => {}} />
            </Box>
            <Box width={700} height={300} sx={{ textAlign: 'center' }}>
              <h3>Grade</h3>
              {<input
                type="text"
                placeholder="Grade"
                style={{ width: '5%', height: '10%', textAlign: 'start', paddingLeft: '10px' }}
                value={grade}
                onChange={() => { }}
              />}
            </Box>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {/* Container for Checker's comment */}
              <div style={{ display: 'flex', flexDirection: 'column', marginRight: '20px', borderRight: '1px solid #ccc' }}>
                  {appealAnsFieldExists ? (
                      <>
                      <Box width={300}>
                      <h3>Lecturer's Respond</h3>
                      
                  <TextBox value={appealAnsValue} onChange={() => { }} disabled />
                  <h3>Grade</h3>
                  <input
                    type="text"
                    placeholder="Grade"
                    style={{ width: '12%', height: '10%', textAlign: 'start', paddingLeft: '10px' }}
                    value={grade}
                    onChange={() => { }}
                  />
                  </Box>
                      </>
                  ) : (
                      <>
                      {/* Render content when appealAnsFieldExists is false */}
                      <Box width={250}>
                      <h3>Checker's comment</h3>
                      <TextBox value={comment} onChange={() => { }} />
                      </Box>
                      <Box width={150} height={100} sx={{ textAlign: 'center' }}>
                          <h3>Grade</h3>
                          <input
                          type="text"
                          placeholder="Grade"
                          style={{ width: '25%', height: '30%', textAlign: 'start', paddingLeft: '10px' }}
                          value={grade}
                          onChange={() => { }}
                          />
                      </Box>
                      </>
                  )}
                  </div>
              
              
              <Box width={500} height={365} sx={{ textAlign: 'center' }}>
                {!appealFieldExists ? (
                  <>
                    <h3>Write appeal</h3>
                    <TextBox value={appealValue} onChange={handleAppealValue} />
                    <button onClick={handleAppealSubmit}>Send</button>
                  </>
                ) : (
                  <>
                    <h3>Your's appeal</h3>
                    <TextBox value={appealValue} onChange={() => { }} disabled />
                  </>
                )}
              </Box>
            </div>
          </CustomTabPanel>
        </Box>
      );
  }

  StudentViewTabs.propTypes = {
    assignmentID: PropTypes.string.isRequired,
  };
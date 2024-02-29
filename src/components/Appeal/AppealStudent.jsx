import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import TextBox from "../MuiComponents/TextBox";
import { db } from "../../config/fire-base";


export default function AppealStudent({ assignment}) {
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [appealValue, setAppealValue] = useState(""); // Define state for appeal input value
  const [appealAnsValue, setAppealAnsValue] = useState(""); // Define state for appeal input value
  const [appealFieldExists, setAppealFieldExists] = useState(false); // State to track if "Appeal" field exists
  const [appealAnsFieldExists, setAppealAnsFieldExists] = useState(false); // State to track if lecturer ans the appeal
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const data = assignment
          setComment(data.Comment || "");
          setGrade(data.Grade || "");
          // Check if "Appeal" field exists
          if ("Appeal" in data) {
            setAppealFieldExists(true);
            setAppealValue(data.Appeal); // Set appealValue state to the value of "Appeal" field
          }

          // Check if "AppealAns" field exists
          if ("AppealAns" in data) {
            setAppealAnsFieldExists(true);
            setAppealAnsValue(data.AppealAns); // Set appealValue state to the value of "AppealAns" field
          } else {
            setAppealAnsFieldExists(false);
          }

          setOpen(true); // Update the state to open the modal after data fetching is complete
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [appealValue, appealAnsValue]);

  const handleAppealSubmit = async () => {
    try {
      // Get a reference to the Firestore document
      const documentRef = doc(db, "assignments", assignment.id);

      // Create an object with the grade and comment data
      const data = {
        Appeal: appealValue, // Assume appealValue is the value entered by the user in the appealTextBox input field
        AppealAns: appealAnsValue,
      };

      // Use updateDoc() method to update the document with the new data
      await updateDoc(documentRef, data);
      console.log("Document successfully updated!");
      setOpen(false); // Close the modal after successful submission
      onClose(); // Call the onClose function passed from the parent component
      // Reset appealValue after submission
      setAppealValue(""); // or setAppealValue(null);
      setAppealAnsValue("");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleAppealValue = (event) => {
    const { value } = event.target;
    setAppealValue(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
      {/* Container for Checker's comment and Write appeal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginRight: "20px",
          borderRight: "1px solid #ccc",
          paddingRight: "20px",
        }}
      >
        {/* Checker's comment section */}
        {appealAnsFieldExists ? (
          <Box width={300} height={365}>
            <h3>Lecturer's Respond</h3>
            <TextBox value={appealAnsValue} onChange={() => {}} disabled />
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              width={150} 
              height={50} 
              sx={{ textAlign: "center" }}
              style={{ marginTop: '30px' }}
            >
              <div style={{ marginRight: "15px" }}>
                <h3 style={{ margin: '0' }}>Grade:</h3>
              </div>
              <label 
                style={{ 
                  backgroundColor: grade > 60 ? '#C8E6C9' : '#FFCDD2', 
                  padding: '4px', 
                  borderRadius: '4px',
                }}
              >
                {grade}
              </label>
            </Box>
          </Box>
        ) : (
          <Box width={250}>
            <h3>Checker's comment</h3>
            <TextBox value={comment} onChange={() => {}} />
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              width={150} 
              height={50} 
              sx={{ textAlign: "center" }}
              style={{ marginTop: '30px' }} // Adjusted margin bottom
            >
              <div style={{ marginRight: "15px"}}>
                <h3 style={{ margin: '0' }}>Grade:</h3>
              </div>
              <label 
                style={{ 
                  backgroundColor: grade > 60 ? '#C8E6C9' : '#FFCDD2', 
                  padding: '4px', 
                  borderRadius: '4px',
                }}
              >
                {grade}
              </label>
            </Box>
          </Box>
        )}
      </div>
  
      {/* Write appeal section */}
      <Box width={480} height={365} sx={{ textAlign: "center" }}>
        {!appealFieldExists ? (
          <>
            <h3>Write appeal</h3>
            <TextBox value={appealValue} onChange={handleAppealValue} />
            <button type="button"
                className="inputButton"
                variant="contained" 
                style={{marginTop:40}} onClick={handleAppealSubmit}>Send</button>
          </>
        ) : (
          <>
            <h3>Your's appeal</h3>
            <TextBox value={appealValue} onChange={() => {}} disabled />
          </>
        )}
      </Box>
    </div>
  );
  
  
  
  
}


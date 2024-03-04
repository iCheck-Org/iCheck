import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import TextBox from "../MuiComponents/TextBox";
import { db } from "../../config/fire-base";


export default function AppealStudent({ assignment }) {
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [appealValue, setAppealValue] = useState("");
  const [appealAnsValue, setAppealAnsValue] = useState("");
  const [appealFieldExists, setAppealFieldExists] = useState(false);
  const [appealAnsFieldExists, setAppealAnsFieldExists] = useState(false);
  const [open, setOpen] = useState(true);
  const [showSubmitButton, setShowSubmitButton] = useState(false); // State to track whether to show the "Submit" button

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = assignment;
        setComment(data.Comment || "");
        setGrade(data.Grade || "");
        if ("Appeal" in data) {
          setAppealFieldExists(true);
          setAppealValue(data.Appeal);
        }
        if ("AppealAns" in data) {
          setAppealAnsFieldExists(true);
          setAppealAnsValue(data.AppealAns);
        } else {
          setAppealAnsFieldExists(false);
        }
        setOpen(true);
        // Set the state to show the "Submit" button only when necessary
        setShowSubmitButton(!("Appeal" in data || "AppealAns" in data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [assignment]);

  const handleAppealSubmit = async () => {
    try {
      const documentRef = doc(db, "assignments", assignment.id);
      const data = {
        Appeal: appealValue,
      };
      await updateDoc(documentRef, data);
      console.log("Document successfully updated!");
      setOpen(false);
      onClose();
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginRight: "20px",
          borderRight: "1px solid #ccc",
          paddingRight: "20px",
        }}
      >
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
              style={{ marginTop: "30px" }}
            >
              <div style={{ marginRight: "15px" }}>
                <h3 style={{ margin: "0" }}>Grade:</h3>
              </div>
              <label
                style={{
                  backgroundColor: grade > 60 ? "#C8E6C9" : "#FFCDD2",
                  padding: "4px",
                  borderRadius: "4px",
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
              style={{ marginTop: "30px" }}
            >
              <div style={{ marginRight: "15px" }}>
                <h3 style={{ margin: "0" }}>Grade:</h3>
              </div>
              <label
                style={{
                  backgroundColor: grade > 60 ? "#C8E6C9" : "#FFCDD2",
                  width: "50px",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                {grade}
              </label>
            </Box>
          </Box>
        )}
      </div>

      <Box width={480} height={365} sx={{ textAlign: "center" }}>
        {!appealFieldExists && !appealAnsFieldExists && showSubmitButton ? ( // Only show the "Submit" button when necessary
          <>
            <h3>Write appeal</h3>
            <TextBox value={appealValue} onChange={handleAppealValue} />
            <button
              type="button"
              className="inputButton"
              variant="contained"
              style={{ marginTop: 40 }}
              onClick={handleAppealSubmit}
            >
              Send
            </button>
          </>
        ) : (
          <>
            <h3>Your appeal</h3>
            <TextBox value={appealValue} onChange={() => {}} disabled />
          </>
        )}
      </Box>
    </div>
  );
}



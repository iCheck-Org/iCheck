import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import TextBox from "../MuiComponents/TextBox";

export default function ShowReview({ assignment }) {
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const data = assignment;
    setComment(data.Comment || "");
    setGrade(data.Grade || "");
    setOpen(true); // Update the state to open the modal after data fetching is complete
  }, [assignment]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Box width={700} height={250} sx={{ textAlign: "center" }}>
        <h2>Checker's Comment</h2>
        <TextBox value={comment} onChange={() => {}} />
      </Box>
      <Box display="flex" alignItems="center" justifyContent="center" width={150} height={100} sx={{ textAlign: "center" }}>
              <div style={{ marginRight: "15px" }}>
                <h3>Grade:</h3>
              </div>
              <label style={{ backgroundColor: grade > 60 ? '#C8E6C9' : '#FFCDD2', padding: '4px', borderRadius: '4px' }}>{grade}</label>
      </Box>
    </div>
  );
}

ShowReview.propTypes = {
  assignment: PropTypes.object.isRequired,
};

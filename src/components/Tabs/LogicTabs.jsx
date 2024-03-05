import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React, { useState} from "react";
import ShowReview from "../Review/ShowReview";
import AppealStudent from "../Appeal/AppealStudent";
import AppealTabs from "../Appeal/AppealLecturer";

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
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function LogicTabs({ assignment, typePermision, onSuccessGrade, onSuccessAppeal}) {
  const [value, setValue] = useState(0); // Initialize value state

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {typePermision === "checker" && (
            <Tab label="Review Assignment" {...a11yProps(0)} />
          )}
          {typePermision === "student" && [
          <Tab label="Review Assignment" {...a11yProps(0)} />,
          <Tab label="Appeal" {...a11yProps(1)} />
          ]}
          {typePermision === "lecturer" && [
            <Tab key={0} label="Checker's comment" {...a11yProps(0)} />,
            <Tab key={1} label="Student's respond" {...a11yProps(1)} />,
            <Tab key={2} label="Lecturer's respond" {...a11yProps(2)} />
          ]}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <ShowReview assignment={assignment} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <AppealStudent assignment={assignment} onSuccessAppeal={onSuccessAppeal}/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <AppealTabs assignment={assignment} onSuccessGrade={onSuccessGrade} />
      </CustomTabPanel>
    </Box>
  );
}

LogicTabs.propTypes = {
  assignment: PropTypes.object.isRequired,
};

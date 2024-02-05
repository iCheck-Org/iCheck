import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Backdrop, Typography } from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/fire-base";
import GetAppIcon from "@mui/icons-material/GetApp";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BackDropSample from "./BackDropSample";
// import Moment from "react-moment";


const PATH_URL_PDF = "http://localhost:5173/Week3 Assignment - Dor Shir.pdf";

const columns = [
  { field: "Course", headerName: "Course", width: 130 },
  {
    field: "Assignment No.",
    headerName: "Assignment No.",
    width: 140,
    align: "center",
  },
  { field: "Checked By", headerName: "Checked By", width: 150 },
  {
    field: "Due Date",
    headerName: "Due Date",
    width: 440,
    // renderCell: (params) => (
    //   <Moment format="YYYY/MM/DD HH:mm:ss">{params.value ? params.value.toDate() : null}</Moment>
    // ),
  },
  { field: "Status", headerName: "Status", width: 110 },
  {
    field: "Actions",
    headerName: "Actions",
    width: 140,

    renderCell: (value) => {
      const isClickableDownload = value.row.Status !== "None";
      const isClickableShow = value.row.Status !== "Checked";
      const isClickableUpload = value.row.Status !== "Checked";

      const onDownload = (url) => {
        const filename = url.split("/").pop();
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      };

      return (
        <div>
          <IconButton
            onClick={
              isClickableDownload
                ? (event) => onDownload(PATH_URL_PDF)
                : undefined
            }
            disabled={!isClickableDownload}
          >
            <GetAppIcon />
          </IconButton>
          <IconButton
            onClick={() => handleUploadOpen(value.row.id)}
            disabled={!isClickableUpload}
          >
            <UploadIcon />
          </IconButton>
          <IconButton disabled={!isClickableShow}>
            <VisibilityIcon />
          </IconButton>
        </div>
      );
    },
  },
];

const fetchUserId = async (db, userUid) => {
  try {
    // Query the 'users' collection where the 'id' field equals the user's UID
    const querySnapshot = await getDocs(
      query(collection(db, "users"), where("id", "==", userUid))
    );

    // If a document is found, return its document ID
    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      return userId;
    } else {
      // If no document is found, return null
      return null;
    }
  } catch (error) {
    console.error("Error fetching user ID from Firestore:", error);
    return null;
  }
};

const TableTest = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          console.log("User is not defined. Aborting data fetching.");
          return;
        }
        const userId = await fetchUserId(db, user.uid);
        const coursesSnapshot = await getDocs(
          query(
            collection(db, "courses-test"),
            where("students", "array-contains", userId)
          )
        );

        const courseIds = coursesSnapshot.docs.map((course) => course.id);
        const assignmentsSnapshot = await getDocs(
          query(
            collection(db, "assignments"),
            where("Course-ref", "in", courseIds)
          )
        );

        const data = assignmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRows(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    console.log("Starting data fetching process...");
    fetchData();
  }, [user]);

  const handleUploadOpen = (rowId) => {
    setSelectedRowId(rowId);
    setUploadOpen(true);
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
  };

  return (
    <Box height={400} width={1300}>
      <img src='/src/logo/icheck_logo_1.png' alt="Logo" className="dashboard-logo"/>
      <DataGrid columns={columns} rows={rows} />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadOpen}
        onClick={handleUploadClose}
      >
        <Box>
          {selectedRowId && (
            <BackDropSample rowId={selectedRowId} onClose={handleUploadClose} />
          )}
        </Box>
      </Backdrop>
    </Box>
  );
};

export default TableTest;

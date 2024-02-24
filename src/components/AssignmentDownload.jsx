
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/Fire-base";

export const AssignmentDownload = async (row , firebaseUser) => {
    try {
      const userId = firebaseUser.id;
      const File_doc = row["File_doc"]; // Access the row object and get the value of "File_doc"
      console.log(File_doc);
      // Fetch all documents from the "pdfs" collection
      const querySnapshot = await getDocs(collection(db, "pdfs"));
      // Iterate through each document
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        // Compare the File_doc with the document ID
        if (doc.id === File_doc) {
          const downloadURL = doc.data().url;

          // Trigger the file download
          const filename = downloadURL.split("/").pop();
          const link = document.createElement("a");
          link.href = downloadURL;
          link.setAttribute("download", filename); // Set the download attribute
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });
    } catch (error) {
      console.error("Error fetching document for download:", error);
    }
  };
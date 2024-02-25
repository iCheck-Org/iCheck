import {
  updateDoc,
  doc,
  collection,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../config/Fire-base";
import '../../pages/styles.css';

export const handleFileUpload = async (rowId) => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";

      fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
          const assignmentRef = doc(db, "assignments", rowId);
          const assignmentDoc = await getDoc(assignmentRef);
          const existingDocId = assignmentDoc.data().File_doc;

          if (existingDocId) {
            const storageRef = ref(storage, file.name);
            await uploadBytes(storageRef, file);

            // Update the existing document with the new storage URL and timestamp
            await updateDoc(doc(db, "pdfs", existingDocId), {
              name: file.name,
              url: await getDownloadURL(storageRef),
              timestamp: serverTimestamp(),
            });

            await updateDoc(assignmentRef, {
              submissionDate: serverTimestamp(),
              File_doc: existingDocId,
            });
          } 
          else {
            // If no document exists, create a new document
            const storageRef = ref(storage, `pdfs/${file.name}`);
            await uploadBytes(storageRef, file);

            // Get the download URL and timestamp of the uploaded file
            const downloadURL = await getDownloadURL(storageRef);
            const timestamp = serverTimestamp();

            // Create a new document in the "pdfs" collection
            const newDocRef = await addDoc(collection(db, "pdfs"), {
              name: file.name,
              url: downloadURL,
              timestamp: timestamp,
            });

            await updateDoc(assignmentRef, {
              submissionDate: serverTimestamp(),
              File_doc: newDocRef.id,
            });
            // Update the corresponding document in the "assignments" collection
          }
          setFileUploadedSuccessfuly(true); // Corrected the setter function name
          // Update the state to indicate a successful file upload
          //TODO(IK): is there a use for this?
          setFileUploaded(true);
        }
      });

      // Trigger the file input click
      fileInput.click();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
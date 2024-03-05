// Import necessary dependencies
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/fire-base"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp, // Add this import for server timestamp
} from "firebase/firestore";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField"; // Add import for text field

export default function MessageBoard() {
  const navigate = useNavigate();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [senderDetails, setSenderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState(""); // State for new message input
  const [courseDetails, setCourseDetails] = useState({}); // State for storing course details

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchData = async () => {
          try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const userRecord = userSnap.data();

            setFirebaseUser(userRecord);

            // Fetch messages relevant to the user's courses
            const messagesData = [];
            const courseDetails = {}; // Object to store course details
            for (const courseId of userRecord.courses) {
              // Fetch course details (including name)
              const courseRef = doc(db, "courses", courseId);
              const courseSnap = await getDoc(courseRef);
              const courseData = courseSnap.data();
              courseDetails[courseId] = courseData.name; // Store course name

              const messagesQuery = query(
                collection(db, "courses", courseId, "messages"),
                orderBy("timestamp", "desc"), // Order by timestamp in descending order
                limit(30) // Limit the result to 50 messages
              );
              const querySnapshot = await getDocs(messagesQuery);
              querySnapshot.forEach((doc) => {
                const messageData = doc.data();
                const messageWithUserInfo = {
                  ...messageData,
                  course: courseData.name, // Include course name in message
                };
                messagesData.push(messageWithUserInfo);
              });
            }
            setMessages(messagesData);
            setCourseDetails(courseDetails); // Store course details in state
          } catch (error) {
            console.error("Error fetching data from Firestore:", error);
          }
        };

        fetchData();
      } else {
        navigate("/");
      }
      return () => unsubscribe();
    });
  }, []);

  // Function to format timestamp to human-readable string
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return ""; // Return empty string if timestamp is not valid
    }
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  // Function to fetch sender details
  const fetchSenderDetails = async (senderId) => {
    try {
      setLoading(true);
      const senderRef = doc(db, "users", senderId);
      const senderDoc = await getDoc(senderRef);
      const senderData = senderDoc.data();
      setSenderDetails(senderData);
    } catch (error) {
      console.error("Error fetching sender details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle click event of the sender details button
  const handleSenderDetailsClick = async (senderId) => {
    setSelectedMessage(senderId);
    await fetchSenderDetails(senderId);
  };

  // Function to handle input change for new message
  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  // Function to handle submit of new message
  const handleSubmitNewMessage = async () => {
    try {
      setLoading(true);
      if (firebaseUser && newMessage.trim() !== "") {
        const userCourses = firebaseUser.courses;
        if (userCourses.length > 0) {
          const courseId = userCourses[0];
          if (firebaseUser && firebaseUser.name) {
            const newMessageData = {
              content: newMessage,
              sender: firebaseUser.id,
              senderName: firebaseUser.name,
              course: courseId,
            };

            // Add the document to Firestore
            const docRef = await addDoc(
              collection(db, "courses", courseId, "messages"),
              {
                ...newMessageData,
                timestamp: serverTimestamp(),
              }
            );

            // Fetch the newly added message from Firestore
            const docSnap = await getDoc(docRef);
            const addedMessage = { id: docSnap.id, ...docSnap.data() };

            // Update the messages state with the newly added message
            setMessages([...messages, addedMessage]);

            // Clear new message input field after submission
            setNewMessage("");
          } else {
            console.error("Sender details are missing.");
          }
        } else {
          console.error("User is not enrolled in any courses.");
        }
      } else {
        console.error("New message content is empty.");
      }
    } catch (error) {
      console.error("Error adding new message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {firebaseUser && (
        <>
          <h2>Message Board</h2>
          <div>
            {messages.map((message, index) => (
              <div key={index}>
                <p>Course: {message.course}</p>
                <p>Content: {message.content}</p>
                <p>Posted by: {message.senderName}</p>
                <p>Timestamp: {formatTimestamp(message.timestamp)}</p>
                <Button
                  onClick={() => handleSenderDetailsClick(message.sender)}
                  disabled={loading}
                >
                  Sender Details
                </Button>
              </div>
            ))}
          </div>
          <Box>
            <TextField
              label="New Message"
              variant="outlined"
              value={newMessage}
              onChange={handleNewMessageChange}
              disabled={loading}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitNewMessage}
              disabled={loading}
            >
              Submit
            </Button>
          </Box>
          <Backdrop
            open={selectedMessage !== null}
            onClick={() => setSelectedMessage(null)}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "16px",
                borderRadius: "8px",
                minWidth: "200px",
                maxWidth: "400px",
                textAlign: "left",
              }}
            >
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <div>
                  {senderDetails && (
                    <>
                      <p>Name: {senderDetails.name}</p>
                      <p>Email: {senderDetails.email}</p>
                      <p>Phone: {senderDetails.phone}</p>
                    </>
                  )}
                  <Button
                    onClick={() => setSelectedMessage(null)}
                    sx={{
                      marginTop: "auto", // Pushes the button to the bottom
                      textAlign: "center",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </Box>
          </Backdrop>
        </>
      )}
    </div>
  );
}

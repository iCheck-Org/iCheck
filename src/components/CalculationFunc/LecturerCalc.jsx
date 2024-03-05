// calculate the average grade for a student
export const calculateAverageGrade = (assignmentsSnapshot) => { 
    let totalGrade = 0;
    let numberOfGrades = 0;
    // Loop through each assignment
    assignmentsSnapshot.docs.forEach((doc) => {
      const assignmentData = doc.data();
      const grade = parseInt(assignmentData.grade);

      // Check if the grade is a valid number
      if (!isNaN(grade)) {
        totalGrade += grade;
        numberOfGrades++;
      }
    });

    // Calculate the average grade
    const averageGrade = numberOfGrades > 0 ? totalGrade / numberOfGrades : 0;
    // Set averageGrade as state
    return (parseFloat(averageGrade.toFixed(2)));
};

// calculate the number of open assignments for a student
export const calculateOpenAssignments = (assignmentsSnapshot) => {
    let openAssignmentsCount = 0;
    const currentDate = new Date().getTime();

    assignmentsSnapshot.docs.forEach((doc) => {
      const assignmentData = doc.data();
      const dueDateTimestamp = assignmentData["due Date"].toDate();
      const dueDate = dueDateTimestamp.getTime();

      if (dueDate > currentDate) {
        console.log("dueDate", dueDate.toLocaleString());
        console.log("currentDate", currentDate.toLocaleString());
        openAssignmentsCount++;
      }
    });

    return openAssignmentsCount;
};

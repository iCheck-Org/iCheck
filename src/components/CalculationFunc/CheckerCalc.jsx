// Code to calculate the number of open assignments for a student
export const calculateOpenAssignments = (assignmentsData) => {
    let checkedAssignmentCount = 0;
    let unCheckedAssignmentCount = 0;
  
    assignmentsData.forEach((assignmentData) => {
      const checker = assignmentData.data().Checker;
      if (checker === "") {
        console.log("I enter here!");
        unCheckedAssignmentCount++;
      } else {
        checkedAssignmentCount++;
      }
    });
  
    return { checkedAssignmentCount, unCheckedAssignmentCount };
  };
  
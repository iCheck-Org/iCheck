# iCheck.

## Description
iCheck. is a student assignment management system designed as a web application to streamline the process of managing student assignments. It provides three different levels of permissions: one for students, one for assignment checkers, and one for lecturers. Each permission level has its own authentication and offers distinct functionality tailored to its users' needs. The application utilizes Firebase Realtime Database for data storage and management.

## Authors
- [Dor Shir](https://github.com/Dorshir)
- [Bar Alayof](https://github.com/barmud3)
- [Itamar Kuznitsov](https://github.com/Itamar-Kuznitsov)
- [Shachar Ketz](https://github.com/Shachar97)

## Table of Contents
- [Description](#description)
- [Authors](#authors)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [UML Diagrams](#uml-diagrams)
- [Architecture](#architecture)
- [Contributing](#contributing)

<details>
<summary><b>Documents</b></summary>

- [Initiation Document](./public/documents/Initiation_Document.pdf)
- [Analysis Document](./public/documents/Analysis_Document.pdf)
- [Requirements Documentm](./public/documents/Requirements_Document.pdf)
- [Demo Video](./public/documents/iCheck.mp4)
- [Presentation](./public/documents/presentation.pdf)

</details>


## Features
- **Authentication**: Secure authentication system for students, assignment checkers, and lecturers.
- **Role-based Access Control**: Different functionality and permissions based on user roles.
- **Student Dashboard**: Interface for students to submit assignments, view feedback and view their average grade, total assignments, open assignments, and open appeals. Students can also apply appeals.
- **Assignment Checker Dashboard**: Tools for assignment checking, including reviewing and providing feedback.
- **Lecturer Dashboard**: Management tools for lecturers to oversee assignments, grading, assignment appeals. And to view their average grades, open assignments, total appeals, and open courses.
- **Firebase Realtime Database Integration**: Utilizes Firebase for efficient data storage and synchronization.
- **Material-UI (MUI)**: UI library for React components.

## Installation
1. Clone the repository: `git clone https://github.com/iCheck-Org/iCheck.git`
2. Install dependencies: `npm install`
3. Configure Firebase Realtime Database: Create a Firebase project and set up Realtime Database according to your application's requirements.
4. Configure Authentication: Set up Firebase Authentication to authenticate users based on their roles.
5. Run the application: `npm run dev`
6. Access the application locally: Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

## Usage
1. **Student Usage**: Students should log in with their credentials and access the dashboard to submit assignments.
2. **Assignment Checker Usage**: Assignment checkers can log in to review and provide feedback on submitted assignments.
3. **Lecturer Usage**: Lecturers can log in to manage assignments, view submissions, and grade assignments.

### Test Accounts
- **Student Account**: 
  - Email: student@gmail.com
  - Password: 123123
- **Assignment Checker Account**: 
  - Email: checker@gmail.com
  - Password: 123123
- **Lecturer Account**: 
  - Email: lecturer@gmail.com
  - Password: 123123

## UML Diagrams

### Use Case Diagram
<img src="./public/documents/UseCase.png" alt="Use Case Diagram" width="600">

### Activity Diagram
<img src="./public/documents/Activity.png" alt="Activity Diagram" width="600">

### Sequence Diagram
<img src="./public/documents/Sequence.png" alt="Sequence Diagram" width="600">

## Architecture
The iCheck application follows the MVVM (Model-View-ViewModel) architecture pattern. This architectural pattern separates the application into three layers: Model, View, and ViewModel. 
- **Model**: Represents the data and business logic of the application. In iCheck, Firebase Realtime Database serves as the Model layer, handling data storage and management.
- **View**: Represents the user interface components. In iCheck, React components, built with Material-UI, constitute the View layer.
- **ViewModel**: Acts as an intermediary between the Model and View layers. In iCheck, the ViewModel layer manages the presentation logic and state of the application, coordinating data flow between the Model and View.

## Contributing
We welcome contributions from the community. If you have any ideas for improvements or would like to report a bug, please submit an issue.

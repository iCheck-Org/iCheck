import * as React from 'react';
import { DataGrid} from '@mui/x-data-grid';
import { Box } from '@mui/material';

// import { useDemoData } from '@mui/x-data-grid-generator';
// import { db }  from '../config/firebase-Assigments';
import {getDocs , collection} from 'firebase/firestore';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
    editable: true,
  },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
    editable: true,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];



const DataTable = () => {

  return (
  <Box height = {400} witdh = {800}>
    <DataGrid columns={columns} rows ={rows}/>
  </Box>)
};

export default DataTable


// export default function ColumnSelectorGrid() {
//   const { data } = useDemoData({
//     dataSet: 'Commosity',
//     rowLength: 10,
//     maxColumns: 10,
//   });

  
// const[tableData, setTableData] = useState([])

// useEffect(() => {
//   fetch("https://jsonplaceholder.typicode.com/posts")
//   .then((data) => data.json())
//   .then((data) => setTableData(data))
// }

import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import { TextField } from '@mui/material';

export default function BackDropSample() {
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div>
      <Button onClick={handleOpen}>Show backdrop</Button>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      >
        <Box>
          <Button variant='contained' onClick={() => setOpen(false)}>
            Close
          </Button>
        </Box>
      </Backdrop>
    </div>
  );
}

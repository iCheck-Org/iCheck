import { Snackbar, Alert } from '@mui/material';

const AlertSnackbar = ({ open, setOpen, severity, message }) => (
  <Snackbar
    open={open}
    autoHideDuration={3000} // Hide after 3 seconds
    onClose={() => setOpen(false)} // Hide when the Snackbar is closed
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Position at the bottom left corner
  >
    <Alert severity={severity} onClose={() => setOpen(false)}>
      {message}
    </Alert>
  </Snackbar>
);

export default AlertSnackbar;
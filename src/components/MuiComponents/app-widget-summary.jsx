import PropTypes from 'prop-types';
import numeral from 'numeral';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

  

// ----------------------------------------------------------------------

export default function AppWidgetSummary({ title, total, icon, color = 'primary', sx, ...other }) {
    return (
      <Card
        component={Stack}
        spacing={3}
        direction="row"
        sx={{
          px: 0,
          py: 1,
          borderRadius: 2,
          backgroundColor: color,
          width: 220,
          height: 100,
          ...sx,
        }}
        {...other}
      >
        {icon && <Box sx={{ width: 64, height: 64 }}>{icon}</Box>}
  
        <Stack spacing={0.5}>
          <Typography variant="h4"  sx={{ color: '#24305e' }} >{total}</Typography>
  
          <Typography variant="subtitle2" sx={{ color: '#24305e' }}>
            {title}
          </Typography>
        </Stack>
      </Card>
    );
  }
  
  AppWidgetSummary.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    sx: PropTypes.object,
    title: PropTypes.string,
    total: PropTypes.number,
  };
import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export default function SwitchAppeal({ onToggle }) {
  const [checked, setChecked] = React.useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    onToggle(event.target.checked);
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch checked={checked} onChange={handleChange} />}
        label="Appeal's Table"
      />
    </FormGroup>
  );
}
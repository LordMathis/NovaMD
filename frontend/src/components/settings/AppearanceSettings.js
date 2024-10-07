import React from 'react';
import { Typography, Switch, FormControlLabel } from '@mui/material';

const AppearanceSettings = ({ themeSettings, onThemeChange }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={themeSettings === 'dark'}
            onChange={onThemeChange}
            color="primary"
          />
        }
        label="Dark Mode"
      />
    </div>
  );
};

export default AppearanceSettings;

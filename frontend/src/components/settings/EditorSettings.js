import React from 'react';
import { Typography, Switch, FormControlLabel, Tooltip } from '@mui/material';

const EditorSettings = ({ autoSave, onAutoSaveChange }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Editor
      </Typography>
      <Tooltip title="Auto Save feature is coming soon!" placement="right">
        <FormControlLabel
          control={
            <Switch
              checked={autoSave}
              onChange={(e) => onAutoSaveChange(e.target.checked)}
              color="primary"
              disabled
            />
          }
          label="Auto Save"
        />
      </Tooltip>
    </div>
  );
};

export default EditorSettings;

import React from 'react';
import {
  Typography,
  Switch,
  TextField,
  FormControlLabel,
  Box,
} from '@mui/material';

const GitSettings = ({
  gitEnabled,
  gitUrl,
  gitUser,
  gitToken,
  gitAutoCommit,
  gitCommitMsgTemplate,
  onInputChange,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Git Integration
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={gitEnabled}
            onChange={(e) => onInputChange('gitEnabled', e.target.checked)}
            color="primary"
          />
        }
        label="Enable Git"
      />
      <Box
        sx={{
          opacity: gitEnabled ? 1 : 0.5,
          pointerEvents: gitEnabled ? 'auto' : 'none',
        }}
      >
        <TextField
          fullWidth
          label="Git URL"
          value={gitUrl}
          onChange={(e) => onInputChange('gitUrl', e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Git Username"
          value={gitUser}
          onChange={(e) => onInputChange('gitUser', e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Git Token"
          type="password"
          value={gitToken}
          onChange={(e) => onInputChange('gitToken', e.target.value)}
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={gitAutoCommit}
              onChange={(e) => onInputChange('gitAutoCommit', e.target.checked)}
              color="primary"
            />
          }
          label="Auto Commit"
        />
        <TextField
          fullWidth
          label="Commit Message Template"
          value={gitCommitMsgTemplate}
          onChange={(e) =>
            onInputChange('gitCommitMsgTemplate', e.target.value)
          }
          margin="normal"
        />
      </Box>
    </Box>
  );
};

export default GitSettings;

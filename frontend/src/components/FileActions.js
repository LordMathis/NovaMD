import React from 'react';
import { Button, ButtonGroup, Tooltip, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Commit as CommitIcon,
} from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';
import { useModalContext } from '../contexts/ModalContext';

const FileActions = ({ handlePullChanges, selectedFile }) => {
  const { settings } = useSettings();
  const {
    setNewFileModalVisible,
    setDeleteFileModalVisible,
    setCommitMessageModalVisible,
  } = useModalContext();

  const handleCreateFile = () => setNewFileModalVisible(true);
  const handleDeleteFile = () => setDeleteFileModalVisible(true);
  const handleCommitAndPush = () => setCommitMessageModalVisible(true);

  return (
    <ButtonGroup variant="outlined" size="small">
      <Tooltip title="Create new file">
        <IconButton onClick={handleCreateFile} size="small">
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={selectedFile ? 'Delete current file' : 'No file selected'}
      >
        <span>
          <IconButton
            onClick={handleDeleteFile}
            disabled={!selectedFile}
            size="small"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={
          settings.gitEnabled
            ? 'Pull changes from remote'
            : 'Git is not enabled'
        }
      >
        <span>
          <IconButton
            onClick={handlePullChanges}
            disabled={!settings.gitEnabled}
            size="small"
          >
            <SyncIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={
          !settings.gitEnabled
            ? 'Git is not enabled'
            : settings.gitAutoCommit
            ? 'Auto-commit is enabled'
            : 'Commit and push changes'
        }
      >
        <span>
          <IconButton
            onClick={handleCommitAndPush}
            disabled={!settings.gitEnabled || settings.gitAutoCommit}
            size="small"
          >
            <CommitIcon />
          </IconButton>
        </span>
      </Tooltip>
    </ButtonGroup>
  );
};

export default FileActions;

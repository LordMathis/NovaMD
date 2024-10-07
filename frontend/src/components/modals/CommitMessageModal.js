import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useModalContext } from '../../contexts/ModalContext';

const CommitMessageModal = ({ onCommitAndPush }) => {
  const [message, setMessage] = useState('');
  const { commitMessageModalVisible, setCommitMessageModalVisible } =
    useModalContext();

  const handleSubmit = async () => {
    if (message) {
      await onCommitAndPush(message);
      setMessage('');
      setCommitMessageModalVisible(false);
    }
  };

  return (
    <Dialog
      open={commitMessageModalVisible}
      onClose={() => setCommitMessageModalVisible(false)}
    >
      <DialogTitle>Enter Commit Message</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Commit Message"
          type="text"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setCommitMessageModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Commit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommitMessageModal;

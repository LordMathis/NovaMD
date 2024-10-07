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

const CreateFileModal = ({ onCreateFile }) => {
  const [fileName, setFileName] = useState('');
  const { newFileModalVisible, setNewFileModalVisible } = useModalContext();

  const handleSubmit = async () => {
    if (fileName) {
      await onCreateFile(fileName);
      setFileName('');
      setNewFileModalVisible(false);
    }
  };

  return (
    <Dialog
      open={newFileModalVisible}
      onClose={() => setNewFileModalVisible(false)}
    >
      <DialogTitle>Create New File</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="File Name"
          type="text"
          fullWidth
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setNewFileModalVisible(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFileModal;

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useModalContext } from '../../contexts/ModalContext';

const DeleteFileModal = ({ onDeleteFile, selectedFile }) => {
  const { deleteFileModalVisible, setDeleteFileModalVisible } =
    useModalContext();

  const handleConfirm = async () => {
    await onDeleteFile(selectedFile);
    setDeleteFileModalVisible(false);
  };

  return (
    <Dialog
      open={deleteFileModalVisible}
      onClose={() => setDeleteFileModalVisible(false)}
    >
      <DialogTitle>Delete File</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{selectedFile}"?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setDeleteFileModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFileModal;

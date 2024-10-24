import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { saveFileContent, deleteFile } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import { useGitOperations } from './useGitOperations';

export const useFileOperations = () => {
  const { settings } = useSettings();
  const { handleCommitAndPush } = useGitOperations(settings.gitEnabled);

  const autoCommit = useCallback(
    async (filePath, action) => {
      if (settings.gitAutoCommit && settings.gitEnabled) {
        let commitMessage = settings.gitCommitMsgTemplate
          .replace('${filename}', filePath)
          .replace('${action}', action);

        // Capitalize the first letter of the commit message
        commitMessage =
          commitMessage.charAt(0).toUpperCase() + commitMessage.slice(1);

        await handleCommitAndPush(commitMessage);
      }
    },
    [settings, handleCommitAndPush]
  );

  const handleSave = useCallback(
    async (filePath, content) => {
      try {
        await saveFileContent(filePath, content);
        notifications.show({
          title: 'Success',
          message: 'File saved successfully',
          color: 'green',
        });
        autoCommit(filePath, 'update');
        return true;
      } catch (error) {
        console.error('Error saving file:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to save file',
          color: 'red',
        });
        return false;
      }
    },
    [autoCommit]
  );

  const handleDelete = useCallback(
    async (filePath) => {
      try {
        await deleteFile(filePath);
        notifications.show({
          title: 'Success',
          message: 'File deleted successfully',
          color: 'green',
        });
        autoCommit(filePath, 'delete');
        return true;
      } catch (error) {
        console.error('Error deleting file:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete file',
          color: 'red',
        });
        return false;
      }
    },
    [autoCommit]
  );

  const handleCreate = useCallback(
    async (fileName, initialContent = '') => {
      try {
        await saveFileContent(fileName, initialContent);
        notifications.show({
          title: 'Success',
          message: 'File created successfully',
          color: 'green',
        });
        autoCommit(fileName, 'create');
        return true;
      } catch (error) {
        console.error('Error creating new file:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to create new file',
          color: 'red',
        });
        return false;
      }
    },
    [autoCommit]
  );

  return { handleSave, handleDelete, handleCreate };
};

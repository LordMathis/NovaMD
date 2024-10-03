import React, { useState, useEffect } from 'react';
import {
  Grid,
  Breadcrumbs,
  Tabs,
  Dot,
  useTheme,
  useToasts,
} from '@geist-ui/core';
import { Code, Eye } from '@geist-ui/icons';
import FileTree from './FileTree';
import FileActions from './FileActions';
import CreateFileModal from './modals/CreateFileModal';
import DeleteFileModal from './modals/DeleteFileModal';
import CommitMessageModal from './modals/CommitMessageModal';
import ContentView from './ContentView';
import { commitAndPush, saveFileContent, deleteFile } from '../services/api';
import { isImageFile } from '../utils/fileHelpers';
import { useSettings } from '../contexts/SettingsContext';

const MainContent = ({
  content,
  files,
  selectedFile,
  hasUnsavedChanges,
  onFileSelect,
  onContentChange,
  onSave,
  pullLatestChanges,
  onLinkClick,
  lookupFileByName,
}) => {
  const [activeTab, setActiveTab] = useState('source');
  const { type: themeType } = useTheme();
  const { setToast } = useToasts();
  const { settings } = useSettings();
  const [newFileModalVisible, setNewFileModalVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [deleteFileModalVisible, setDeleteFileModalVisible] = useState(false);
  const [commitMessageModalVisible, setCommitMessageModalVisible] =
    useState(false);

  useEffect(() => {
    if (isImageFile(selectedFile)) {
      setActiveTab('preview');
    }
  }, [selectedFile]);

  const handleTabChange = (value) => {
    if (!isImageFile(selectedFile) || value === 'preview') {
      setActiveTab(value);
    }
  };

  const handlePull = async () => {
    try {
      await pullLatestChanges();
      setToast({ text: 'Successfully pulled latest changes', type: 'success' });
    } catch (error) {
      setToast({
        text: 'Failed to pull changes: ' + error.message,
        type: 'error',
      });
    }
  };

  const handleCreateFile = () => {
    setNewFileModalVisible(true);
  };

  const handleNewFileSubmit = async () => {
    if (newFileName) {
      try {
        await saveFileContent(newFileName, '');
        setToast({ text: 'New file created successfully', type: 'success' });
        await pullLatestChanges();
        onFileSelect(newFileName);
      } catch (error) {
        setToast({
          text: 'Failed to create new file: ' + error.message,
          type: 'error',
        });
      }
    }
    setNewFileModalVisible(false);
    setNewFileName('');
  };

  const handleDeleteFile = () => {
    setDeleteFileModalVisible(true);
  };

  const confirmDeleteFile = async () => {
    try {
      await deleteFile(selectedFile);
      setToast({ text: 'File deleted successfully', type: 'success' });
      await pullLatestChanges();
      onFileSelect(null);
    } catch (error) {
      setToast({
        text: 'Failed to delete file: ' + error.message,
        type: 'error',
      });
    }
    setDeleteFileModalVisible(false);
  };

  const handleCommitAndPush = () => {
    setCommitMessageModalVisible(true);
  };

  const confirmCommitAndPush = async (message) => {
    try {
      await commitAndPush(message);
      setToast({
        text: 'Changes committed and pushed successfully',
        type: 'success',
      });
      await pullLatestChanges();
    } catch (error) {
      setToast({
        text: 'Failed to commit and push changes: ' + error.message,
        type: 'error',
      });
    }
    setCommitMessageModalVisible(false);
  };

  const renderBreadcrumbs = () => {
    if (!selectedFile) return null;
    const pathParts = selectedFile.split('/');
    return (
      <div className="breadcrumbs-container">
        <Breadcrumbs>
          {pathParts.map((part, index) => (
            <Breadcrumbs.Item key={index}>{part}</Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
        {hasUnsavedChanges && (
          <Dot type="warning" className="unsaved-indicator" />
        )}
      </div>
    );
  };

  return (
    <>
      <Grid.Container gap={1} height="calc(100vh - 64px)">
        <Grid xs={24} sm={6} md={5} lg={4} height="100%" className="sidebar">
          <div className="file-tree-container">
            <FileActions
              selectedFile={selectedFile}
              gitEnabled={settings.gitEnabled}
              gitAutoCommit={settings.gitAutoCommit}
              onPull={handlePull}
              onCommitAndPush={handleCommitAndPush}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
            <FileTree
              files={files}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          </div>
        </Grid>
        <Grid
          xs={24}
          sm={18}
          md={19}
          lg={20}
          height="100%"
          className="main-content"
        >
          <div className="content-header">
            {renderBreadcrumbs()}
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tabs.Item
                label={<Code />}
                value="source"
                disabled={isImageFile(selectedFile)}
              />
              <Tabs.Item label={<Eye />} value="preview" />
            </Tabs>
          </div>
          <div className="content-body">
            <ContentView
              activeTab={activeTab}
              content={content}
              selectedFile={selectedFile}
              onContentChange={onContentChange}
              onSave={onSave}
              themeType={themeType}
              onLinkClick={onLinkClick}
              lookupFileByName={lookupFileByName}
            />
          </div>
        </Grid>
      </Grid.Container>
      <CreateFileModal
        visible={newFileModalVisible}
        onClose={() => setNewFileModalVisible(false)}
        onSubmit={handleNewFileSubmit}
        fileName={newFileName}
        setFileName={setNewFileName}
      />
      <DeleteFileModal
        visible={deleteFileModalVisible}
        onClose={() => setDeleteFileModalVisible(false)}
        onConfirm={confirmDeleteFile}
        fileName={selectedFile}
      />
      <CommitMessageModal
        visible={commitMessageModalVisible}
        onClose={() => setCommitMessageModalVisible(false)}
        onSubmit={confirmCommitAndPush}
      />
    </>
  );
};

export default MainContent;

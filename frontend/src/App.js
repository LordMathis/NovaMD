import React from 'react';
import { GeistProvider, CssBaseline, Page } from '@geist-ui/core';
import Header from './components/Header';
import MainContent from './components/MainContent';
import useFileManagement from './hooks/useFileManagement';
import './App.scss';

function App() {
  const {
    content,
    files,
    selectedFile,
    isNewFile,
    hasUnsavedChanges,
    error,
    handleFileSelect,
    handleContentChange,
    handleSave,
  } = useFileManagement();

  return (
    <GeistProvider>
      <CssBaseline />
      <Page>
        <Header />
        <Page.Content>
          <MainContent
            content={content}
            files={files}
            selectedFile={selectedFile}
            isNewFile={isNewFile}
            hasUnsavedChanges={hasUnsavedChanges}
            error={error}
            onFileSelect={handleFileSelect}
            onContentChange={handleContentChange}
            onSave={handleSave}
          />
        </Page.Content>
      </Page>
    </GeistProvider>
  );
}

export default App;
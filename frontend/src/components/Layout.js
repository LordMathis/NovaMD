import React from 'react';
import { AppShell, Container } from '@mantine/core';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useFileNavigation } from '../hooks/useFileNavigation';
import { useFileList } from '../hooks/useFileList';

const Layout = () => {
  const { selectedFile, handleFileSelect, handleLinkClick } =
    useFileNavigation();
  const { files, loadFileList } = useFileList();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Container
          size="xl"
          p={0}
          style={{
            display: 'flex',
            height: 'calc(100vh - 60px - 2rem)', // Subtracting header height and vertical padding
            overflow: 'hidden', // Prevent scrolling in the container
          }}
        >
          <Sidebar
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            files={files}
            loadFileList={loadFileList}
          />
          <MainContent
            selectedFile={selectedFile}
            handleFileSelect={handleFileSelect}
            handleLinkClick={handleLinkClick}
            loadFileList={loadFileList}
          />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;

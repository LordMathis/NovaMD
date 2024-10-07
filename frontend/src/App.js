import React from 'react';
import { GeistProvider, CssBaseline as GeistCssBaseline } from '@geist-ui/core';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline as MuiCssBaseline,
  createTheme,
  Container,
} from '@mui/material';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ModalProvider } from './contexts/ModalContext';
import './App.scss';

function AppContent() {
  const { settings, loading } = useSettings();

  if (loading) {
    return <div>Loading...</div>;
  }

  const muiTheme = createTheme({
    palette: {
      mode: settings.theme,
    },
  });

  return (
    <GeistProvider themeType={settings.theme}>
      <MuiThemeProvider theme={muiTheme}>
        <GeistCssBaseline />
        <MuiCssBaseline />
        <Container maxWidth="xl" className="app-container">
          <Header />
          <main className="main-content">
            <MainContent />
          </main>
        </Container>
      </MuiThemeProvider>
    </GeistProvider>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </SettingsProvider>
  );
}

export default App;

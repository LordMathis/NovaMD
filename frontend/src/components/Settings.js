import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';
import AppearanceSettings from './settings/AppearanceSettings';
import EditorSettings from './settings/EditorSettings';
import GitSettings from './settings/GitSettings';
import { useModalContext } from '../contexts/ModalContext';

const initialState = {
  localSettings: {},
  initialSettings: {},
  hasUnsavedChanges: false,
};

function settingsReducer(state, action) {
  switch (action.type) {
    case 'INIT_SETTINGS':
      return {
        ...state,
        localSettings: action.payload,
        initialSettings: action.payload,
        hasUnsavedChanges: false,
      };
    case 'UPDATE_LOCAL_SETTINGS':
      const newLocalSettings = { ...state.localSettings, ...action.payload };
      const hasChanges =
        JSON.stringify(newLocalSettings) !==
        JSON.stringify(state.initialSettings);
      return {
        ...state,
        localSettings: newLocalSettings,
        hasUnsavedChanges: hasChanges,
      };
    case 'MARK_SAVED':
      return {
        ...state,
        initialSettings: state.localSettings,
        hasUnsavedChanges: false,
      };
    case 'RESET':
      return {
        ...state,
        localSettings: state.initialSettings,
        hasUnsavedChanges: false,
      };
    default:
      return state;
  }
}

const Settings = () => {
  const { settings, updateSettings, updateTheme } = useSettings();
  const { settingsModalVisible, setSettingsModalVisible } = useModalContext();
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const isInitialMount = useRef(true);
  const updateThemeTimeoutRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      dispatch({ type: 'INIT_SETTINGS', payload: settings });
    }
  }, [settings]);

  const handleInputChange = useCallback((key, value) => {
    dispatch({ type: 'UPDATE_LOCAL_SETTINGS', payload: { [key]: value } });
  }, []);

  const handleThemeChange = useCallback(() => {
    const newTheme = state.localSettings.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'UPDATE_LOCAL_SETTINGS', payload: { theme: newTheme } });

    if (updateThemeTimeoutRef.current) {
      clearTimeout(updateThemeTimeoutRef.current);
    }
    updateThemeTimeoutRef.current = setTimeout(() => {
      updateTheme(newTheme);
    }, 0);
  }, [state.localSettings.theme, updateTheme]);

  const handleSubmit = async () => {
    try {
      await updateSettings(state.localSettings);
      dispatch({ type: 'MARK_SAVED' });
      // Note: You might want to implement a toast or snackbar for MUI
      console.log('Settings saved successfully');
      setSettingsModalVisible(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Implement error handling, possibly with a MUI Snackbar
    }
  };

  const handleClose = useCallback(() => {
    if (state.hasUnsavedChanges) {
      updateTheme(state.initialSettings.theme);
      dispatch({ type: 'RESET' });
    }
    setSettingsModalVisible(false);
  }, [
    state.hasUnsavedChanges,
    state.initialSettings.theme,
    updateTheme,
    setSettingsModalVisible,
  ]);

  useEffect(() => {
    return () => {
      if (updateThemeTimeoutRef.current) {
        clearTimeout(updateThemeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog
      open={settingsModalVisible}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Settings
        {state.hasUnsavedChanges && (
          <WarningIcon
            style={{
              marginLeft: '8px',
              verticalAlign: 'middle',
              color: theme.palette.warning.main,
            }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <AppearanceSettings
          themeSettings={state.localSettings.theme}
          onThemeChange={handleThemeChange}
        />
        <EditorSettings
          autoSave={state.localSettings.autoSave}
          onAutoSaveChange={(value) => handleInputChange('autoSave', value)}
        />
        <GitSettings
          gitEnabled={state.localSettings.gitEnabled}
          gitUrl={state.localSettings.gitUrl}
          gitUser={state.localSettings.gitUser}
          gitToken={state.localSettings.gitToken}
          gitAutoCommit={state.localSettings.gitAutoCommit}
          gitCommitMsgTemplate={state.localSettings.gitCommitMsgTemplate}
          onInputChange={handleInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Settings;

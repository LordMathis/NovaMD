import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import Settings from './Settings';
import { useModalContext } from '../contexts/ModalContext';

const Header = () => {
  const { setSettingsModalVisible } = useModalContext();

  const openSettings = () => setSettingsModalVisible(true);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NovaMD
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src="https://via.placeholder.com/40"
            alt="User"
            sx={{ width: 32, height: 32, marginRight: 2 }}
          />
          <IconButton color="inherit" onClick={openSettings} edge="end">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Settings />
    </AppBar>
  );
};

export default Header;

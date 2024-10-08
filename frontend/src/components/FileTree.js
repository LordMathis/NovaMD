import React from 'react';
import { Tree } from 'react-arborist';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CircleIcon from '@mui/icons-material/Circle';
import { Box } from '@mui/material';

const StyledTree = styled(Tree)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  '& .node': {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .node__icon': {
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
}));

const FileTree = ({ files, handleFileSelect, selectedFile }) => {
  const getIcon = (node) => {
    if (node.isFolder) {
      return <FolderIcon fontSize="small" style={{ color: '#e8a87c' }} />;
    }
    const extension = node.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'md':
        return (
          <DescriptionIcon fontSize="small" style={{ color: '#41b3a3' }} />
        );
      case 'gitignore':
        return <CircleIcon fontSize="small" style={{ color: '#c38d9e' }} />;
      default:
        return <InsertDriveFileIcon fontSize="small" />;
    }
  };

  const renderNode = ({ node, style, dragHandle }) => (
    <div style={style} ref={dragHandle} className="node">
      <span className="node__icon">{getIcon(node)}</span>
      <span>{node.name}</span>
    </div>
  );

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <StyledTree
        data={files}
        renderNode={renderNode}
        onClick={(node) => {
          if (!node.isFolder) {
            handleFileSelect(node.id);
          }
        }}
        selection={selectedFile}
        padding={20}
        openByDefault={false}
      />
    </Box>
  );
};

export default FileTree;

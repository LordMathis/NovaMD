import { API_BASE_URL } from '../utils/constants';
import { apiCall } from './authApi';

export const updateProfile = async (updates) => {
  const response = await apiCall(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteProfile = async (password) => {
  const response = await apiCall(`${API_BASE_URL}/profile`, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
  return response.json();
};

export const fetchLastWorkspaceName = async () => {
  const response = await apiCall(`${API_BASE_URL}/workspaces/last`);
  return response.json();
};

export const fetchFileList = async (workspaceName) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files`
  );
  return response.json();
};

export const fetchFileContent = async (workspaceName, filePath) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files/${filePath}`
  );
  return response.text();
};

export const saveFileContent = async (workspaceName, filePath, content) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files/${filePath}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content,
    }
  );
  return response.json();
};

export const deleteFile = async (workspaceName, filePath) => {
  await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files/${filePath}`,
    {
      method: 'DELETE',
    }
  );
};

export const getWorkspace = async (workspaceName) => {
  const response = await apiCall(`${API_BASE_URL}/workspaces/${workspaceName}`);
  return response.json();
};

// Combined function to update workspace data including settings
export const updateWorkspace = async (workspaceName, workspaceData) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspaceData),
    }
  );
  return response.json();
};

export const pullChanges = async (workspaceName) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/git/pull`,
    {
      method: 'POST',
    }
  );
  return response.json();
};

export const commitAndPush = async (workspaceName, message) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/git/commit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );
  return response.json();
};

export const getFileUrl = (workspaceName, filePath) => {
  return `${API_BASE_URL}/workspaces/${workspaceName}/files/${filePath}`;
};

export const lookupFileByName = async (workspaceName, filename) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files/lookup?filename=${encodeURIComponent(
      filename
    )}`
  );
  const data = await response.json();
  return data.paths;
};

export const updateLastOpenedFile = async (workspaceName, filePath) => {
  await apiCall(`${API_BASE_URL}/workspaces/${workspaceName}/files/last`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath }),
  });
};

export const getLastOpenedFile = async (workspaceName) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}/files/last`
  );
  return response.json();
};

export const listWorkspaces = async () => {
  const response = await apiCall(`${API_BASE_URL}/workspaces`);
  return response.json();
};

export const createWorkspace = async (name) => {
  const response = await apiCall(`${API_BASE_URL}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  return response.json();
};

export const deleteWorkspace = async (workspaceName) => {
  const response = await apiCall(
    `${API_BASE_URL}/workspaces/${workspaceName}`,
    {
      method: 'DELETE',
    }
  );
  return response.json();
};

export const updateLastWorkspaceName = async (workspaceName) => {
  const response = await apiCall(`${API_BASE_URL}/workspaces/last`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workspaceName }),
  });
  return response.json();
};

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const fetchFileList = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/files`);
        if (!response.ok) {
            throw new Error('Failed to fetch file list');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching file list:', error);
        throw error;
    }
};

export const fetchFileContent = async (filePath) => {
    try {
        const response = await fetch(`${API_BASE_URL}/files/${filePath}`);
        if (!response.ok) {
            throw new Error('Failed to fetch file content');
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
    }
};

export const saveFileContent = async (filePath, content) => {
    const response = await fetch(`${API_BASE_URL}/files/${filePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content,
    });
  
    if (!response.ok) {
      throw new Error('Failed to save file');
    }
  
    return await response.text();
  };
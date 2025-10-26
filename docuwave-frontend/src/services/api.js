const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7095/api';

export const apiService = {
  getDocuments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/document`);
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      console.error('Get documents error:', error);
      return null;
    }
  },
  
  uploadDocument: async (file, schemeId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/document/upload?schemeId=${schemeId}&language=en&ocrEngine=Tesseract`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  deleteDocument: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/document/${id}`, { 
        method: 'DELETE' 
      });
      return response.ok;
    } catch (error) {
      console.error('Delete document error:', error);
      return false;
    }
  },

  getSchemes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scheme`);
      if (!response.ok) throw new Error('Failed');
      return await response.json();
    } catch (error) {
      console.error('Get schemes error:', error);
      return null;
    }
  }
};

export default apiService;
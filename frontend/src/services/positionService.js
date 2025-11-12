import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const positionService = {
  // Get all positions
  getAllPositions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  },

  // Get position by ID
  getPositionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching position:', error);
      throw error;
    }
  }
}; 
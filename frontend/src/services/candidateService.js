import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        throw new Error('Error al subir el archivo:', error.response.data);
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/candidates`, candidateData);
        return response.data;
    } catch (error) {
        throw new Error('Error al enviar datos del candidato:', error.response.data);
    }
};

export const getCandidates = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Add optional parameters
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.order) queryParams.append('order', params.order);
        
        const url = `${API_BASE_URL}/candidates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener candidatos:', error.response?.data || error.message);
    }
};
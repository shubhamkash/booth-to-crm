import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const leadAPI = {
  create: (leadData) => api.post('/leads', leadData),
  getById: (id) => api.get(`/leads/${id}`),
  update: (id, leadData) => api.put(`/leads/${id}`, leadData),
  export: (id, format = 'json') => api.get(`/leads/${id}/export?format=${format}`),
};

export const conversationAPI = {
  create: (leadId, audioFile, transcript) => {
    console.log('=== API CALL ===');
    console.log('Creating conversation with transcript:', transcript);
    console.log('Transcript length:', transcript?.length);
    console.log('===============');
    
    const formData = new FormData();
    formData.append('lead_id', leadId);
    formData.append('audio', audioFile);
    if (transcript) {
      formData.append('transcript', transcript);
      console.log('Transcript appended to FormData');
    } else {
      console.log('No transcript to append');
    }
    
    return api.post('/conversations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const enrichmentAPI = {
  enrich: (leadId, email, company) => 
    api.post('/enrich', { lead_id: leadId, email, company }),
};

export default api;
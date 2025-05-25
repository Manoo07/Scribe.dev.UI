import axios from 'axios';
import { Unit, ContentType } from '../types';
import { mockUnits } from './mockData';

// Base URL for API requests
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions

// Get all units for a classroom
export const getUnits = async (classroomId: string): Promise<Unit[]> => {
  try {
    const response = await api.get(`/classroom/${classroomId}/units`);
    return response.data;
  } catch (error) {
    console.error('Error fetching units:', error);
    // Return mock data for demonstration purposes
    return mockUnits;
  }
};

// Create a new unit
export const createUnit = async (classroomId: string, name: string): Promise<Unit> => {
  try {
    const response = await api.post(`/classroom/${classroomId}/units`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

// Update a unit
export const updateUnit = async (unitId: string, name: string): Promise<Unit> => {
  try {
    const response = await api.put(`/units/${unitId}`, { name });
    return response.data;
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

// Delete a unit
export const deleteUnit = async (unitId: string): Promise<void> => {
  try {
    await api.delete(`/units/${unitId}`);
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};

// Create text-based content (note, link, video)
export const createContent = async (unitId: string, type: ContentType, content: string): Promise<void> => {
  try {
    await api.post(`/units/${unitId}/contents`, { type, content });
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Upload file content
export const uploadFile = async (unitId: string, file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', ContentType.DOCUMENT);
    
    await api.post(`/units/${unitId}/contents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete content
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    await api.delete(`/contents/${contentId}`);
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};
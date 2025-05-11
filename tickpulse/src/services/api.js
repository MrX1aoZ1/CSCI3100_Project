import { formatErrorMessage, logError } from '@/utils/errorHandling';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000';

/**
 * Helper for making authenticated requests with error handling
 */
async function fetchWithAuth(endpoint, options = {}) {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle HTTP error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Create an error object with additional properties
      const error = new Error(errorData.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.code = errorData.code;
      error.data = errorData;
      
      throw error;
    }
    
    return response.json();
  } catch (error) {
    // Log the error with context
    logError(`API Call: ${endpoint}`, error);
    
    // Rethrow with formatted message
    const formattedError = new Error(formatErrorMessage(error));
    formattedError.originalError = error;
    throw formattedError;
  }
}

// Task-related API calls with error handling
export const taskApi = {
  // Get all tasks
  getTasks: async () => fetchWithAuth('/tasks'),
  
  getTaskById: async (id) => fetchWithAuth(`/tasks/${id}`),

  createTask: async (taskData) => 
    fetchWithAuth('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    }),

  updateTask: async (id, updates) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteTask: async (id) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: 'DELETE'
    }),

  updateTaskStatus: async (id, status) =>
    fetchWithAuth(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  updateTaskPriority: async (id, priority) =>
    fetchWithAuth(`/tasks/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    }),
  
  updateTaskDeadline: async (id, deadline) =>
    fetchWithAuth(`/tasks/${id}/deadline`, {
      method: 'PUT',
      body: JSON.stringify({ deadline })
    }),

  updateTaskCategory: async (id, category) =>
    fetchWithAuth(`/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category })
    }),

  updateTaskCategory: async (id, category_name) =>
    fetchWithAuth(`/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category_name })
    }),

  updateTaskDeadline: async (id, content) =>
    fetchWithAuth(`/tasks/${id}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    }),
  // Other task API methods with similar error handling...
};

// Project-related API calls with error handling
export const projectApi = {
  // Similar implementation with error handling...
};

// Auth-related API calls with error handling
export const authApi = {
  // Similar implementation with error handling...
};
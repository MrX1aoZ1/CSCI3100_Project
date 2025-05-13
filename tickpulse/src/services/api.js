import { formatErrorMessage, logError } from '@/utils/errorHandling';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000';

/**
 * Helper function for making authenticated API requests.
 * It automatically includes the JWT token from localStorage in the Authorization header.
 * It also handles common error scenarios and formats error messages.
 * @async
 * @param {string} endpoint - The API endpoint (e.g., '/tasks').
 * @param {object} [options={}] - Optional fetch options (method, body, headers).
 * @returns {Promise<any>} A promise that resolves with the JSON response from the API.
 * @throws {Error} Throws an error if the request fails or an authentication issue occurs.
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

/**
 * @namespace taskApi
 * @description An object containing functions for interacting with task-related API endpoints.
 */
export const taskApi = {
  /**
   * Get all tasks for the authenticated user.
   * @async
   * @memberof taskApi
   * @returns {Promise<Array<object>>} A promise that resolves to an array of task objects.
   */
  getTasks: async () => fetchWithAuth('/tasks'),
  
  /**
   * Get a specific task by its ID.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task to retrieve.
   * @returns {Promise<object>} A promise that resolves to the task object.
   */
  getTaskById: async (id) => fetchWithAuth(`/tasks/${id}`),

  /**
   * Create a new task.
   * @async
   * @memberof taskApi
   * @param {object} taskData - The data for the new task.
   * @returns {Promise<object>} A promise that resolves to the created task object.
   */
  createTask: async (taskData) => 
    fetchWithAuth('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    }),

  /**
   * Update an existing task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTask: async (id, updates) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  /**
   * Delete a task by its ID.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task to delete.
   * @returns {Promise<object>} A promise that resolves when the task is deleted.
   */
  deleteTask: async (id) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: 'DELETE'
    }),

  /**
   * Update the status of a task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task.
   * @param {string} status - The new status for the task.
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTaskStatus: async (id, status) =>
    fetchWithAuth(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  /**
   * Update the priority of a task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task.
   * @param {string} priority - The new priority for the task.
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTaskPriority: async (id, priority) =>
    fetchWithAuth(`/tasks/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority })
    }),
  
  /**
   * Update the deadline of a task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task.
   * @param {string} deadline - The new deadline for the task (e.g., 'YYYY-MM-DD').
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTaskDeadline: async (id, deadline) =>
    fetchWithAuth(`/tasks/${id}/deadline`, {
      method: 'PUT',
      body: JSON.stringify({ deadline })
    }),

  /**
   * Update the category of a task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task.
   * @param {string} category_name - The new category name for the task.
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTaskCategory: async (id, category_name) => // Changed 'category' to 'category_name' to match usage
    fetchWithAuth(`/tasks/${id}/category`, {
      method: 'PUT',
      body: JSON.stringify({ category_name }) // Changed 'category' to 'category_name'
    }),

  /**
   * Update the content of a task.
   * @async
   * @memberof taskApi
   * @param {string|number} id - The ID of the task.
   * @param {string} content - The new content for the task.
   * @returns {Promise<object>} A promise that resolves to the updated task object.
   */
  updateTaskContent: async (id, content) => // Changed 'updateTaskDeadline' to 'updateTaskContent' for clarity
    fetchWithAuth(`/tasks/${id}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    }),
  // Other task API methods with similar error handling...
};

// Project-related API calls with error handling
/**
 * @namespace projectApi
 * @description An object containing functions for interacting with project-related API endpoints.
 * (Currently a placeholder, implement methods as needed)
 */
export const projectApi = {
  // Similar implementation with error handling...
};

// Auth-related API calls with error handling
/**
 * @namespace authApi
 * @description An object containing functions for interacting with authentication-related API endpoints.
 * (Currently a placeholder, implement methods as needed)
 */
export const authApi = {
  // Similar implementation with error handling...
};
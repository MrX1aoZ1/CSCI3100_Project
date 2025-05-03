/**
 * Error handling utilities for TickPulse application
 */

// Map backend error codes to user-friendly messages
export const errorMessages = {
  // Auth errors
  'auth/invalid-credentials': 'Invalid email or password',
  'auth/user-not-found': 'No account found with this email',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/weak-password': 'Password is too weak',
  
  // Task errors
  'tasks/not-found': 'The requested task could not be found',
  'tasks/invalid-data': 'Invalid task data provided',
  
  // Project errors
  'projects/not-found': 'The requested project could not be found',
  'projects/invalid-data': 'Invalid project data provided',
  
  // Generic errors
  'network-error': 'Network connection error. Please check your internet connection',
  'server-error': 'Server error. Please try again later',
  'unknown-error': 'An unexpected error occurred'
};

/**
 * Format error for display based on API response
 * @param {Error|Object} error - Error object or API error response
 * @returns {String} User-friendly error message
 */
export const formatErrorMessage = (error) => {
  // If it's an API error with a code
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }
  
  // If it's a network error
  if (error.message && error.message.includes('fetch')) {
    return errorMessages['network-error'];
  }
  
  // If it's a server error (5xx)
  if (error.status && error.status >= 500) {
    return errorMessages['server-error'];
  }
  
  // Use the error message if available, otherwise use generic message
  return error.message || errorMessages['unknown-error'];
};

/**
 * Log errors to console with additional context
 * @param {String} context - Where the error occurred
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  console.error(`[${context}] Error:`, error);
  
  // In production, you could send this to an error tracking service
  // like Sentry instead of just logging to console
};
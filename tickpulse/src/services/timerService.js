// Simple timer service using localStorage
export const timerService = {
  getRecords: async (userId) => {
    try {
      const key = `timerRecords_${userId || 'anonymous'}`;
      const records = localStorage.getItem(key);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error getting timer records:', error);
      return [];
    }
  },
  
  saveRecord: async (record, userId) => {
    try {
      const key = `timerRecords_${userId || 'anonymous'}`;
      const existingRecords = localStorage.getItem(key);
      const records = existingRecords ? JSON.parse(existingRecords) : [];
      records.push(record);
      localStorage.setItem(key, JSON.stringify(records));
      return { success: true };
    } catch (error) {
      console.error('Error saving timer record:', error);
      return { success: false, error };
    }
  },
  
  deleteRecord: async (recordId, userId) => {
    try {
      const key = `timerRecords_${userId || 'anonymous'}`;
      const existingRecords = localStorage.getItem(key);
      if (existingRecords) {
        const records = JSON.parse(existingRecords);
        const updatedRecords = records.filter(record => record.id !== recordId);
        localStorage.setItem(key, JSON.stringify(updatedRecords));
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting timer record:', error);
      return { success: false, error };
    }
  }
};
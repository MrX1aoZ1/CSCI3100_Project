export const filterTasks = (tasks, category) => {
    switch (category) {
      case 'all':
        return tasks.filter(task => task.status !== 'abandoned').sort((a, b) => (a.status === 'completed' ? 1 : 0) - (b.status === 'completed' ? 1 : 0));
      case 'today':
        return tasks.filter(task => task.status === 'active' && task.isToday);
      case 'completed':
        return tasks.filter(task => task.status === 'completed');
      case 'abandoned':
        return tasks.filter(task => task.status === 'abandoned');
      default:
        return tasks;
    }
  };
  
  export const getCategoryName = (category) => {
    switch (category) {
      case 'all':
        return 'All Tasks';
      case 'today':
        return 'Today’s Tasks';
      case 'completed':
        return 'Completed Tasks';
      case 'abandoned':
        return 'Abandoned Tasks';
      default:
        return '';
    }
  };
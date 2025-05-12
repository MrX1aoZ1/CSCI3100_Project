// ... existing code ...
import { useTaskContext } from '../context/TaskContext';

const priorities = ['high', 'medium', 'low'];

export default function TaskFilter() {
  const { selectedPriority, selectPriority } = useTaskContext();

  return (
    <div>
      {priorities.map((priority) => (
        <button
          key={priority}
          onClick={() => selectPriority(priority)}
          style={{
            backgroundColor: selectedPriority === priority ? '#2563eb' : '#f3f4f6',
            color: selectedPriority === priority ? '#fff' : '#000',
            borderRadius: '12px',
            padding: '4px 12px',
            margin: '0 4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {priority}
        </button>
      ))}
    </div>
  );
}
// ... existing code ...
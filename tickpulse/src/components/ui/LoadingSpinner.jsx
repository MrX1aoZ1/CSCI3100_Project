export default function LoadingSpinner({ size = 'medium', color = 'blue' }) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };
  
  const colorClasses = {
    blue: 'border-blue-500',
    gray: 'border-gray-500 dark:border-gray-300',
    white: 'border-white',
  };
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.medium} 
          border-t-transparent ${colorClasses[color] || colorClasses.blue}`}
      />
    </div>
  );
}
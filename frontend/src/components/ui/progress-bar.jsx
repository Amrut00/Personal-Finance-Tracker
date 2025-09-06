export const ProgressBar = ({ value }) => {
    const progressColor = value < 75 ? 'bg-emerald-500' : value < 100 ? 'bg-yellow-500' : 'bg-red-600';
  
    return (
      <div className='w-full h-3 bg-gray-200 rounded-full'>
        <div
          className={`h-full rounded-full ${progressColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    );
  };
  
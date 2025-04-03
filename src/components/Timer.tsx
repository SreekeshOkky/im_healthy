import React from 'react';
import { format, addHours } from 'date-fns';
import { Timer as TimerIcon, Edit2, Clock } from 'lucide-react';

interface TimerProps {
  startTime: number;
  targetHours: number;
  onStartTimeChange: (newStartTime: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ startTime, targetHours, onStartTimeChange }) => {
  const [elapsed, setElapsed] = React.useState<number>(0);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTime, setEditTime] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const progress = (hours + minutes / 60) / targetHours * 100;

  // Calculate estimated end time
  const estimatedEndTime = addHours(new Date(startTime), targetHours);

  const handleStartTimeEdit = () => {
    const currentDate = new Date(startTime);
    setEditTime(format(currentDate, "yyyy-MM-dd'T'HH:mm"));
    setIsEditing(true);
  };

  const handleSaveStartTime = () => {
    const newStartTime = new Date(editTime).getTime();
    if (!isNaN(newStartTime)) {
      onStartTimeChange(newStartTime);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            stroke="#3b82f6"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${progress * 3.14}, 314`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <TimerIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="text-3xl font-bold">
            {hours}h {minutes}m
          </div>
          <div className="text-gray-500">
            Target: {targetHours}h
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Ends at: {format(estimatedEndTime, 'h:mm a')}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center space-y-2">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleSaveStartTime}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleStartTimeEdit}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <Edit2 className="w-4 h-4" />
              <span>Started: {format(startTime, 'MMM d, h:mm a')}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Ends: {format(estimatedEndTime, 'MMM d, h:mm a')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from 'date-fns';
import { FastingSession } from '../types';

interface CalendarProps {
  history: FastingSession[];
  onDayClick: (date: Date, sessions: FastingSession[]) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ history, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getFastingsForDay = (date: Date): FastingSession[] => {
    const fastings = history.filter(fast => {
      const startDate = new Date(fast.startTime);
      const endDate = fast.endTime ? new Date(fast.endTime) : new Date();
      const isMatch = isSameDay(date, startDate) || isSameDay(date, endDate);
      return isMatch;
    });
    return fastings;
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {days.map(day => {
          const fastings = getFastingsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day, fastings)}
              className={`
                aspect-square p-2 relative
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday(day) ? 'border-2 border-blue-500' : ''}
                hover:bg-gray-100 rounded-lg
              `}
            >
              <span className={`
                text-sm
                ${!isCurrentMonth ? 'text-gray-400' : ''}
                ${isToday(day) ? 'font-bold text-blue-500' : ''}
              `}>
                {format(day, 'd')}
              </span>
              {fastings.length > 0 && (
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
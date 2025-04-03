import React from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { FastingSession } from '../types';
import { Clock, Calendar, CalendarDays } from 'lucide-react';

interface FastingStatsProps {
  history: FastingSession[];
}

export const FastingStats: React.FC<FastingStatsProps> = ({ history }) => {
  const calculateFastedHours = (sessions: FastingSession[]) => {
    return sessions.reduce((total, session) => {
      if (!session.endTime) return total;
      const duration = (session.endTime - session.startTime) / (1000 * 60 * 60);
      return total + duration;
    }, 0);
  };

  const getSessionsInInterval = (start: Date, end: Date) => {
    return history.filter(session => {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = session.endTime ? new Date(session.endTime) : new Date();
      return isWithinInterval(sessionStart, { start, end }) || 
             isWithinInterval(sessionEnd, { start, end });
    });
  };

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const todayHours = calculateFastedHours(getSessionsInInterval(todayStart, todayEnd));
  const weekHours = calculateFastedHours(getSessionsInInterval(weekStart, weekEnd));
  const monthHours = calculateFastedHours(getSessionsInInterval(monthStart, monthEnd));

  const stats = [
    {
      label: 'Today',
      value: todayHours.toFixed(1),
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'This Week',
      value: weekHours.toFixed(1),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      label: 'This Month',
      value: monthHours.toFixed(1),
      icon: CalendarDays,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Fasting Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className={`p-2 rounded-full bg-gray-100 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-xl font-semibold">{stat.value}h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
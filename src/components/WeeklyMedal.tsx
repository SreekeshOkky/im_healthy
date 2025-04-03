import React from 'react';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Medal } from 'lucide-react';
import { FastingSession } from '../types';

interface WeeklyMedalProps {
  history: FastingSession[];
}

export const WeeklyMedal: React.FC<WeeklyMedalProps> = ({ history }) => {
  const getMedalColor = (session: FastingSession) => {
    if (!session.endTime) return 'text-gray-400';
    
    const actualDuration = (session.endTime - session.startTime) / (1000 * 60 * 60);
    const targetDuration = session.targetHours;
    const completionPercentage = (actualDuration / targetDuration) * 100;

    if (completionPercentage >= 100) return 'text-yellow-500'; // Gold
    if (completionPercentage >= 70) return 'text-gray-400'; // Silver
    return 'text-amber-700'; // Bronze
  };

  const weeklySessions = history.filter(session => 
    session.endTime && 
    isWithinInterval(new Date(session.endTime), { 
      start: startOfWeek(new Date()), 
      end: endOfWeek(new Date()) 
    })
  );

  const medalCounts = weeklySessions.reduce((acc, session) => {
    const color = getMedalColor(session);
    if (color === 'text-yellow-500') acc.gold++;
    else if (color === 'text-gray-400') acc.silver++;
    else acc.bronze++;
    return acc;
  }, { gold: 0, silver: 0, bronze: 0 });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Achievement</h3>
          <p className="text-sm text-gray-500">Completed fasts this week</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Medal className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">{medalCounts.gold}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Medal className="w-6 h-6 text-gray-400" />
              <span className="text-lg font-bold text-gray-900">{medalCounts.silver}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Medal className="w-6 h-6 text-amber-700" />
              <span className="text-lg font-bold text-gray-900">{medalCounts.bronze}</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{weeklySessions.length}</span>
        </div>
      </div>
    </div>
  );
}; 
import React from 'react';
import { format, differenceInHours } from 'date-fns';
import { History } from 'lucide-react';
import { FastingSession } from '../types';

interface FastingHistoryProps {
  history: FastingSession[];
}

export const FastingHistory: React.FC<FastingHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <History className="w-12 h-12 mx-auto mb-2" />
        <p>No fasting history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((fast) => (
        <div
          key={fast.id}
          className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
        >
          <div>
            <div className="text-sm text-gray-500">
              {format(fast.startTime, 'MMM d, yyyy')}
            </div>
            <div className="font-semibold">
              {format(fast.startTime, 'h:mm a')} - {fast.endTime ? format(fast.endTime, 'h:mm a') : 'Ongoing'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {fast.endTime ? differenceInHours(fast.endTime, fast.startTime) : '-'}h
            </div>
            <div className="text-sm text-gray-500">Target: {fast.targetHours}h</div>
          </div>
        </div>
      ))}
    </div>
  );
};
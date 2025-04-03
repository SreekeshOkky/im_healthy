import React, { useState } from 'react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { FastingSession } from '../types';
import { Timer as TimerIcon, Trash2, Pencil, Check, X } from 'lucide-react';
import { Toast } from './Toast';

interface FastingDetailsProps {
  date: Date;
  sessions: FastingSession[];
  onClose: () => void;
  onDelete?: (fastId: string) => void;
  onUpdateEndTime: (newEndTime: number) => Promise<void>;
}

export const FastingDetails: React.FC<FastingDetailsProps> = ({
  date,
  sessions,
  onClose,
  onDelete,
  onUpdateEndTime
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEndTime, setNewEndTime] = useState<string>(
    sessions.length > 0 && sessions[0].endTime ? format(sessions[0].endTime, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [error, setError] = useState<string>('');

  const handleDelete = async (fastId: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(fastId);
      setToast({ message: 'Fasting session deleted successfully', type: 'success' });
      setDeleteConfirmId(null);
    } catch (error) {
      setToast({ message: 'Failed to delete fasting session', type: 'error' });
    }
  };

  const getCompletedTime = (startTime: number, endTime: number | null) => {
    if (!endTime) return 'Ongoing';
    const hours = differenceInHours(endTime, startTime);
    const minutes = differenceInMinutes(endTime, startTime) % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError('');
  };

  const handleSave = async () => {
    if (!newEndTime) {
      setError('Please select an end time');
      return;
    }

    const selectedTime = new Date(newEndTime).getTime();
    const now = Date.now();

    if (selectedTime > now) {
      setError('End time cannot be in the future');
      return;
    }

    if (selectedTime < sessions[0].startTime) {
      setError('End time cannot be before start time');
      return;
    }

    try {
      await onUpdateEndTime(selectedTime);
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Failed to update end time');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewEndTime(sessions.length > 0 && sessions[0].endTime ? format(sessions[0].endTime, "yyyy-MM-dd'T'HH:mm") : '');
    setError('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {format(date, 'MMMM d, yyyy')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TimerIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No fasting sessions on this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Started: {format(session.startTime, 'h:mm a')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">
                        Target: {session.targetHours}h
                      </div>
                      {onDelete && (
                        <button
                          onClick={() => setDeleteConfirmId(session.id)}
                          className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {session.endTime && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Ended: {format(session.endTime, 'h:mm a')}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Completed: {getCompletedTime(session.startTime, session.endTime)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Fasting Session</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this fasting session? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Edit End Time Dialog */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Fasting Details</h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">End Time</p>
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    max={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Check size={16} className="mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X size={16} className="mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-lg font-medium text-gray-900">
                  {getCompletedTime(sessions[0].startTime, sessions[0].endTime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-lg font-medium text-gray-900">
                  {sessions.length > 0 && sessions[0].targetHours}h
                </p>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setDeleteConfirmId(sessions[0].id)}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Fast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
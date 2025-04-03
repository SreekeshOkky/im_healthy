import React from 'react';
import { Timer as TimerIcon, Play, Square, History, LogOut } from 'lucide-react';
import { useFasting } from './hooks/useFasting';
import { useAuth } from './contexts/AuthContext';
import { useAnalytics } from './hooks/useAnalytics';
import { Timer } from './components/Timer';
import { Calendar } from './components/Calendar';
import { FastingDetails } from './components/FastingDetails';
import { FastingStats } from './components/FastingStats';
import { WeeklyMedal } from './components/WeeklyMedal';
import { MonthlyChart } from './components/MonthlyChart';
import { FastingSession } from './types';
import { InstallPrompt } from './components/InstallPrompt';
import { useToast } from './hooks/useToast';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user, signInWithGoogle, logout } = useAuth();
  const {
    activeFast,
    history,
    startFast,
    endFast,
    deleteFast,
    updateEndTime,
    updateStartTime
  } = useFasting();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedSessions, setSelectedSessions] = React.useState<FastingSession[]>([]);
  const [showEndFastConfirm, setShowEndFastConfirm] = React.useState(false);
  const toast = useToast();
  const { trackEvent } = useAnalytics();

  const handleDayClick = (date: Date, sessions: FastingSession[]) => {
    if (date > new Date()) {
      return;
    }

    setSelectedDate(date);
    setSelectedSessions(sessions);
    trackEvent('view_fasting_details', { date: date.toISOString() });
  };

  const handleDelete = async (fastId: string) => {
    await deleteFast(fastId);
    setSelectedSessions(prev => prev.filter(session => session.id !== fastId));
    trackEvent('delete_fasting_session', { fastId });
  };

  const handleEndFast = async () => {
    if (!activeFast) return;
    
    const currentDuration = (Date.now() - activeFast.startTime) / (1000 * 60 * 60);
    const isCompleted = currentDuration >= activeFast.targetHours;

    if (!isCompleted) {
      setShowEndFastConfirm(true);
      return;
    }

    await endFast();
    trackEvent('end_fast', {
      targetHours: activeFast.targetHours,
      actualHours: currentDuration,
      completed: true
    });
  };

  const confirmEndFast = async () => {
    if (!activeFast) return;
    const currentDuration = (Date.now() - activeFast.startTime) / (1000 * 60 * 60);
    await endFast();
    trackEvent('end_fast', {
      targetHours: activeFast.targetHours,
      actualHours: currentDuration,
      completed: false
    });
    setShowEndFastConfirm(false);
  };

  const handleStartFast = async (hours: number) => {
    await startFast(hours);
    trackEvent('start_fast', { targetHours: hours });
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
    trackEvent('sign_in');
  };

  const handleLogout = async () => {
    await logout();
    trackEvent('sign_out');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <TimerIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-6">iFastAssistant</h1>
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TimerIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">iFastAssistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-6 w-6 text-gray-600" />
              </button>
              <div className="flex items-center">
                <img
                  src={user.photoURL || ''}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="order-3 lg:order-1">
              <WeeklyMedal history={history} />
            </div>
            <div className="order-1 lg:order-2">
              <FastingStats history={history} />
            </div>
            <div className="order-4 lg:order-3">
              <MonthlyChart history={history} />
            </div>
            <div className="order-2 lg:order-4">
              <Calendar history={history} onDayClick={handleDayClick} />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            {activeFast ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Current Fast</h2>
                <Timer 
                  startTime={activeFast.startTime} 
                  targetHours={activeFast.targetHours} 
                  onStartTimeChange={updateStartTime}
                />
                <button
                  onClick={handleEndFast}
                  className="mt-6 flex items-center justify-center w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="w-5 h-5 mr-2" />
                  End Fast
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Start a New Fast</h2>
                <div className="space-y-4">
                  {[16, 18, 20].map(hours => (
                    <button
                      key={hours}
                      onClick={() => handleStartFast(hours)}
                      className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {hours}:8 Fast
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedDate && (
        <FastingDetails
          date={selectedDate}
          sessions={selectedSessions}
          onClose={() => setSelectedDate(null)}
          onDelete={handleDelete}
          onUpdateEndTime={async (newEndTime) => {
            try {
              await updateEndTime(selectedSessions[0].id, newEndTime);
              setSelectedDate(null);
              toast({
                title: 'Success',
                description: 'Fasting end time updated successfully',
                type: 'success'
              });
            } catch (error) {
              toast({
                title: 'Error',
                description: 'Failed to update fasting end time',
                type: 'error'
              });
            }
          }}
        />
      )}

      {/* End Fast Confirmation Dialog */}
      {showEndFastConfirm && activeFast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">End Fast Early?</h3>
            <p className="text-gray-600 mb-6">
              You haven't completed your target duration of {activeFast.targetHours} hours. Are you sure you want to end this fast?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEndFastConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Continue Fasting
              </button>
              <button
                onClick={confirmEndFast}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                End Fast
              </button>
            </div>
          </div>
        </div>
      )}
      <InstallPrompt />
    </div>
  );
}

export default App;
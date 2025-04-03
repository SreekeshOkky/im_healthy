export interface FastingSession {
  id: string;
  userId: string;
  startTime: number;
  endTime: number | null;
  targetHours: number;
}

export interface FastingState {
  activeFast: FastingSession | null;
  history: FastingSession[];
}
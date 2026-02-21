import { useCallback } from 'react';

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'Success' | 'Error' | 'Info' | 'Warning';
  ipAddress?: string;
  details?: string;
}

// --- Helpers ---
const addSystemLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
  const newLog: LogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toLocaleString(),
    ...log
  };
  const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
  localStorage.setItem('systemLogs', JSON.stringify([newLog, ...existingLogs]));
  return newLog;
};

const getSystemLogs = (): LogEntry[] => {
  return JSON.parse(localStorage.getItem('systemLogs') || '[]');
};

// --- Hook ---
export const useSystemLogs = () => {
  // Add log
  const logAction = useCallback(
    (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
      return addSystemLog(log);
    },
    []
  );

  // Fetch logs
  const fetchLogs = useCallback((): LogEntry[] => {
    return getSystemLogs();
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    localStorage.removeItem('systemLogs');
  }, []);

  return { logAction, fetchLogs, clearLogs };
};

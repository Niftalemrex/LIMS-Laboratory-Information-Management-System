// src/components/contexts/SystemLogsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'Success' | 'Error' | 'Info' | 'Warning';
  ipAddress?: string;
  details?: string;
}

interface SystemLogsContextType {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => Promise<void>;
  clearLogs: () => Promise<void>;
}

const SystemLogsContext = createContext<SystemLogsContextType | undefined>(undefined);

export const SystemLogsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const API_URL = 'http://127.0.0.1:8000/api/system/logs/';

  // Fetch logs once on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(API_URL);
      // Handle plain array or DRF paginated response
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else if (res.data.results && Array.isArray(res.data.results)) {
        setLogs(res.data.results);
      } else {
        console.warn('SystemLogs: unexpected API response', res.data);
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to fetch system logs:', err);
      setLogs([]);
    }
  };

  const addLog = async (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    try {
      const res = await axios.post(API_URL, log);
      if (res.data) {
        setLogs(prev => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add log:', err);
    }
  };

  const clearLogs = async () => {
    // Frontend-only clear (backend clear not implemented)
    setLogs([]);
  };

  return (
    <SystemLogsContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </SystemLogsContext.Provider>
  );
};

export const useSystemLogs = () => {
  const context = useContext(SystemLogsContext);
  if (!context) throw new Error('useSystemLogs must be used within SystemLogsProvider');
  return context;
};

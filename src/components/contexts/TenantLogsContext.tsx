import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type LogStatus = 'Success' | 'Error' | 'Info' | 'Warning';

export interface TenantLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: LogStatus;
  ipAddress?: string;
  details?: string;
}

interface TenantLogsContextType {
  logs: TenantLogEntry[];
  addLog: (log: Omit<TenantLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  fetchLogs: () => TenantLogEntry[];
}

const TenantLogsContext = createContext<TenantLogsContextType | undefined>(undefined);

interface TenantLogsProviderProps {
  children: ReactNode;
  tenantId: string;
}

export const TenantLogsProvider: React.FC<TenantLogsProviderProps> = ({ children, tenantId }) => {
  const [logs, setLogs] = useState<TenantLogEntry[]>([]);
  const API_LOGS = 'http://127.0.0.1:8000/api/tenant/logs/';

  // Fetch logs from backend
  const fetchLogsFromAPI = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await fetch(`${API_LOGS}?tenant=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch tenant logs');
      const data: TenantLogEntry[] = await res.json();
      setLogs(data.reverse()); // newest first
    } catch (err) {
      console.error('Error fetching tenant logs:', err);
      setLogs([]);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchLogsFromAPI();
  }, [fetchLogsFromAPI]);

  const addLog = useCallback((log: Omit<TenantLogEntry, 'id' | 'timestamp'>) => {
    const newLog: TenantLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...log
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const fetchLogs = useCallback(() => logs, [logs]);

  return (
    <TenantLogsContext.Provider value={{ logs, addLog, clearLogs, fetchLogs }}>
      {children}
    </TenantLogsContext.Provider>
  );
};

export const useTenantLogs = (): TenantLogsContextType => {
  const context = useContext(TenantLogsContext);
  if (!context) throw new Error('useTenantLogs must be used within a TenantLogsProvider');
  return context;
};

export interface LogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    status: 'Success' | 'Error' | 'Info' | 'Warning';
    ipAddress?: string;
    details?: string;
  }
  
  // Add new log
  export const addSystemLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      ...log
    };
  
    const existingLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
    localStorage.setItem('systemLogs', JSON.stringify([newLog, ...existingLogs]));
  };
  
  // Get logs
  export const getSystemLogs = (): LogEntry[] => {
    return JSON.parse(localStorage.getItem('systemLogs') || '[]');
  };
  
interface ApiCallLog {
  timestamp: string;
  method: string;
  url: string;
  data?: any;
  status?: number;
  error?: string;
}

class DebugLogger {
  private logs: ApiCallLog[] = [];
  private maxLogs = 50;

  logApiCall(method: string, url: string, data?: any) {
    const log: ApiCallLog = {
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      url,
      data: data ? JSON.stringify(data) : undefined,
    };
    
    this.addLog(log);
    console.log(`🚀 [${log.timestamp}] ${method.toUpperCase()} ${url}`, data || '');
  }

  logApiResponse(method: string, url: string, status: number, data?: any) {
    const existingLogIndex = this.logs.findIndex(
      log => log.method === method.toUpperCase() && log.url === url && !log.status
    );
    
    if (existingLogIndex !== -1) {
      this.logs[existingLogIndex].status = status;
    }
    
    console.log(`✅ [${new Date().toISOString()}] ${method.toUpperCase()} ${url} - ${status}`, data || '');
  }

  logApiError(method: string, url: string, error: any) {
    const existingLogIndex = this.logs.findIndex(
      log => log.method === method.toUpperCase() && log.url === url && !log.status
    );
    
    if (existingLogIndex !== -1) {
      this.logs[existingLogIndex].error = error.message || 'Unknown error';
      this.logs[existingLogIndex].status = error.response?.status || 0;
    }
    
    console.error(`❌ [${new Date().toISOString()}] ${method.toUpperCase()} ${url}`, error);
  }

  private addLog(log: ApiCallLog) {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  getLogs(): ApiCallLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 Debug logs cleared');
  }

  printSummary() {
    const summary = this.logs.reduce((acc, log) => {
      const key = `${log.method} ${log.url}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 API Call Summary:');
    Object.entries(summary).forEach(([endpoint, count]) => {
      console.log(`  ${endpoint}: ${count} calls`);
    });
  }
}

export const debugLogger = new DebugLogger();

// Development modunda global olarak erişilebilir yap
if (__DEV__) {
  (global as any).debugLogger = debugLogger;
}

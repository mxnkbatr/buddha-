/**
 * Admin operations logger for tracking changes and debugging
 */

export interface AdminLogEntry {
  timestamp: Date;
  operation: string;
  userId?: string;
  targetId?: string;
  targetType: 'user' | 'service' | 'booking' | 'application' | 'system';
  action: string;
  success: boolean;
  data?: any;
  error?: string;
  ip?: string;
  userAgent?: string;
}

// In-memory log storage (in production, this should be persisted to database)
const adminLogs: AdminLogEntry[] = [];

/**
 * Log an admin operation
 */
export function logAdminOperation(entry: Omit<AdminLogEntry, 'timestamp'>): void {
  const logEntry: AdminLogEntry = {
    ...entry,
    timestamp: new Date()
  };

  adminLogs.push(logEntry);

  // Keep only last 1000 entries in memory
  if (adminLogs.length > 1000) {
    adminLogs.shift();
  }

  // Console logging for development
  const logLevel = entry.success ? 'info' : 'error';
  const message = `[ADMIN ${logLevel.toUpperCase()}] ${entry.operation}: ${entry.action} ${entry.targetType} ${entry.targetId || ''}`;

  if (entry.success) {
    console.log(message, entry.data ? { data: entry.data } : '');
  } else {
    console.error(message, { error: entry.error, data: entry.data });
  }
}

/**
 * Get recent admin logs
 */
export function getAdminLogs(limit: number = 100): AdminLogEntry[] {
  return adminLogs.slice(-limit).reverse();
}

/**
 * Get logs for specific user
 */
export function getUserLogs(userId: string, limit: number = 50): AdminLogEntry[] {
  return adminLogs
    .filter(log => log.userId === userId)
    .slice(-limit)
    .reverse();
}

/**
 * Get logs for specific target
 */
export function getTargetLogs(targetId: string, targetType?: string, limit: number = 50): AdminLogEntry[] {
  return adminLogs
    .filter(log =>
      log.targetId === targetId &&
      (!targetType || log.targetType === targetType)
    )
    .slice(-limit)
    .reverse();
}

/**
 * Get failed operations
 */
export function getFailedOperations(limit: number = 50): AdminLogEntry[] {
  return adminLogs
    .filter(log => !log.success)
    .slice(-limit)
    .reverse();
}

/**
 * Helper function to create operation context
 */
export function createOperationContext(
  operation: string,
  userId?: string,
  targetId?: string,
  targetType: AdminLogEntry['targetType'] = 'system'
) {
  return {
    operation,
    userId,
    targetId,
    targetType
  };
}

/**
 * Helper function to log successful operation
 */
export function logSuccess(
  context: ReturnType<typeof createOperationContext>,
  action: string,
  data?: any
): void {
  logAdminOperation({
    ...context,
    action,
    success: true,
    data
  });
}

/**
 * Helper function to log failed operation
 */
export function logFailure(
  context: ReturnType<typeof createOperationContext>,
  action: string,
  error: string,
  data?: any
): void {
  logAdminOperation({
    ...context,
    action,
    success: false,
    error,
    data
  });
}
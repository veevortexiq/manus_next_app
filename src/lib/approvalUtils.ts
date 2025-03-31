import { Task, TaskStatus } from '@/lib/types';

// Interface for task history entry
export interface TaskHistoryEntry {
  taskId: number;
  timestamp: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  comment?: string;
  userId?: string; // For future user authentication
}

// In-memory storage for task history (would be replaced with database in production)
let taskHistory: TaskHistoryEntry[] = [];

// Function to add a history entry when a task status changes
export function recordTaskStatusChange(
  taskId: number,
  previousStatus: TaskStatus,
  newStatus: TaskStatus,
  comment?: string,
  userId?: string
): void {
  taskHistory.push({
    taskId,
    timestamp: new Date().toISOString(),
    previousStatus,
    newStatus,
    comment,
    userId
  });
}

// Function to get history for a specific task
export function getTaskHistory(taskId: number): TaskHistoryEntry[] {
  return taskHistory
    .filter(entry => entry.taskId === taskId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Function to get all history entries
export function getAllTaskHistory(): TaskHistoryEntry[] {
  return [...taskHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Function to update task status with history tracking
export function updateTaskStatusWithHistory(
  tasks: Task[],
  taskId: number,
  newStatus: TaskStatus,
  comment?: string,
  userId?: string
): Task[] {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return tasks;
  
  const previousStatus = task.status;
  
  // Record the status change in history
  recordTaskStatusChange(taskId, previousStatus, newStatus, comment, userId);
  
  // Update the task status
  return tasks.map(task => 
    task.id === taskId ? { ...task, status: newStatus } : task
  );
}

// Function for batch approval with history tracking
export function batchUpdateTaskStatusWithHistory(
  tasks: Task[],
  taskIds: number[],
  newStatus: TaskStatus,
  comment?: string,
  userId?: string
): Task[] {
  // Record history for each task being updated
  taskIds.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      recordTaskStatusChange(taskId, task.status, newStatus, comment, userId);
    }
  });
  
  // Update all tasks
  return tasks.map(task => 
    taskIds.includes(task.id) ? { ...task, status: newStatus } : task
  );
}

// Function to get approval statistics
export function getApprovalStats() {
  const totalChanges = taskHistory.length;
  const approvals = taskHistory.filter(entry => entry.newStatus === 'approved').length;
  const rejections = taskHistory.filter(entry => entry.newStatus === 'rejected').length;
  const reviews = taskHistory.filter(entry => entry.newStatus === 'in_review').length;
  
  return {
    totalChanges,
    approvals,
    rejections,
    reviews,
    approvalRate: totalChanges > 0 ? (approvals / totalChanges) * 100 : 0
  };
}

// Function to simulate pushing approved changes to production
export function pushToProduction(taskId: number): Promise<boolean> {
  // This would be an API call to your production system in a real implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${taskId} changes pushed to production`);
      resolve(true);
    }, 1000);
  });
}

// Function to batch push approved tasks to production
export async function batchPushToProduction(taskIds: number[]): Promise<boolean> {
  try {
    // In a real implementation, this might be a transaction or batch API call
    for (const taskId of taskIds) {
      await pushToProduction(taskId);
    }
    return true;
  } catch (error) {
    console.error('Error pushing tasks to production:', error);
    return false;
  }
}

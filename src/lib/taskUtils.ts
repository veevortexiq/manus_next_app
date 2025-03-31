import { Task, TaskStatus, GroupByOption } from '@/lib/types';

// Function to fetch tasks from the JSON file
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/data/tasks.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Function to group tasks by a specific field
export function groupTasks(tasks: Task[], groupBy: GroupByOption): Task[][] {
  const groupedTasks: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    const key = task[groupBy] || 'Unknown';
    if (!groupedTasks[key]) {
      groupedTasks[key] = [];
    }
    groupedTasks[key].push(task);
  });
  
  return Object.values(groupedTasks);
}

// Function to filter tasks based on multiple criteria
export function filterTasks(
  tasks: Task[], 
  filters: {
    category?: string;
    agent?: string;
    status?: TaskStatus;
    search?: string;
    fieldName?: string;
  }
): Task[] {
  return tasks.filter(task => {
    // Filter by category
    if (filters.category && task.Category !== filters.category) {
      return false;
    }
    
    // Filter by agent
    if (filters.agent && task['Recommended AI Agent'] !== filters.agent) {
      return false;
    }
    
    // Filter by status
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Filter by field name
    if (filters.fieldName && task['Field Name'] !== filters.fieldName) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fieldNameMatch = task['Field Name'].toLowerCase().includes(searchLower);
      const triggerMatch = task['Trigger Condition'].toLowerCase().includes(searchLower);
      const taskMatch = task['Suggested Automation Task'].toLowerCase().includes(searchLower);
      const agentMatch = task['Recommended AI Agent'].toLowerCase().includes(searchLower);
      const categoryMatch = task.Category.toLowerCase().includes(searchLower);
      
      if (!(fieldNameMatch || triggerMatch || taskMatch || agentMatch || categoryMatch)) {
        return false;
      }
    }
    
    return true;
  });
}

// Function to sort tasks by a specific field
export function sortTasks(
  tasks: Task[], 
  sortBy: keyof Task, 
  sortOrder: 'asc' | 'desc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'timestamp') {
      valueA = new Date(valueA as string).getTime();
      valueB = new Date(valueB as string).getTime();
    }
    
    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// Function to get task statistics
export function getTaskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    approved: tasks.filter(task => task.status === 'approved').length,
    rejected: tasks.filter(task => task.status === 'rejected').length,
    inReview: tasks.filter(task => task.status === 'in_review').length,
    
    // Group by category
    byCategory: tasks.reduce((acc, task) => {
      const category = task.Category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<string, number>),
    
    // Group by agent
    byAgent: tasks.reduce((acc, task) => {
      const agent = task['Recommended AI Agent'];
      if (!acc[agent]) {
        acc[agent] = 0;
      }
      acc[agent]++;
      return acc;
    }, {} as Record<string, number>)
  };
}

// Function to update task status
export function updateTaskStatus(
  tasks: Task[], 
  taskId: number, 
  newStatus: TaskStatus
): Task[] {
  return tasks.map(task => 
    task.id === taskId ? { ...task, status: newStatus } : task
  );
}

// Function to batch update task statuses
export function batchUpdateTaskStatus(
  tasks: Task[], 
  taskIds: number[], 
  newStatus: TaskStatus
): Task[] {
  return tasks.map(task => 
    taskIds.includes(task.id) ? { ...task, status: newStatus } : task
  );
}

// Function to get unique values for a specific field
export function getUniqueValues(tasks: Task[], field: keyof Task): string[] {
  const values = tasks.map(task => task[field] as string);
  return [...new Set(values)].sort();
}

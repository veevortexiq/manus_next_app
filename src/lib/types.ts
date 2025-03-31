export interface Task {
  id: number;
  'Field Name': string;
  'Trigger Condition': string;
  'Recommended AI Agent': string;
  'Suggested Automation Task': string;
  'Category': string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  timestamp: string;
  steps: string[];
  before: string;
  after: string;
  stagingUrl: string;
}

export type TaskStatus = 'pending' | 'approved' | 'rejected' | 'in_review';

export interface TaskGroup {
  name: string;
  tasks: Task[];
}

export type GroupByOption = 'Category' | 'Recommended AI Agent' | 'Field Name' | 'status';

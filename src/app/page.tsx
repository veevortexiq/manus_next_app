'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, GroupByOption } from '@/lib/types';
import { 
  fetchTasks, 
  filterTasks, 
  sortTasks, 
  getTaskStats, 
  getUniqueValues 
} from '@/lib/taskUtils';
import {
  updateTaskStatusWithHistory,
  batchUpdateTaskStatusWithHistory,
  getTaskHistory,
  getApprovalStats,
  pushToProduction,
  batchPushToProduction
} from '@/lib/approvalUtils';
import TaskList from '@/components/TaskList';
import TaskDetail from '@/components/TaskDetail';
import FilterBar from '@/components/FilterBar';
import ApprovalHistory from '@/components/ApprovalHistory';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    inReview: 0
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: 'asc' | 'desc';
  }>({
    key: 'timestamp',
    direction: 'desc'
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTasks();
        
        // Sort by most recent first by default
        const sortedData = sortTasks(data, 'timestamp', 'desc');
        
        setTasks(sortedData);
        setFilteredTasks(sortedData);
        
        // Extract unique categories and agents
        setCategories(getUniqueValues(data, 'Category'));
        setAgents(getUniqueValues(data, 'Recommended AI Agent'));
        
        // Calculate stats
        const taskStats = getTaskStats(data);
        setStats({
          total: taskStats.total,
          pending: taskStats.pending,
          approved: taskStats.approved,
          rejected: taskStats.rejected,
          inReview: taskStats.inReview
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, []);

  const handleFilterChange = (filters: {
    category?: string;
    agent?: string;
    status?: TaskStatus;
    search?: string;
  }) => {
    const filtered = filterTasks(tasks, {
      category: filters.category,
      agent: filters.agent,
      status: filters.status,
      search: filters.search
    });
    
    // Apply current sort
    const sorted = sortTasks(filtered, sortConfig.key, sortConfig.direction);
    setFilteredTasks(sorted);
  };

  const handleSort = (key: keyof Task) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const sorted = sortTasks(filteredTasks, key, direction);
    
    setSortConfig({ key, direction });
    setFilteredTasks(sorted);
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus, comment?: string) => {
    // If approving, show processing message
    if (newStatus === 'approved') {
      setIsProcessing(true);
      setProcessingMessage(`Processing approval for task #${taskId}...`);
    }
    
    const updatedTasks = updateTaskStatusWithHistory(
      tasks, 
      taskId, 
      newStatus, 
      comment,
      'current-user' // In a real app, this would be the authenticated user ID
    );
    setTasks(updatedTasks);
    
    const updatedFilteredTasks = updateTaskStatusWithHistory(
      filteredTasks, 
      taskId, 
      newStatus,
      comment,
      'current-user'
    );
    setFilteredTasks(updatedFilteredTasks);
    
    // Update stats
    const taskStats = getTaskStats(updatedTasks);
    setStats({
      total: taskStats.total,
      pending: taskStats.pending,
      approved: taskStats.approved,
      rejected: taskStats.rejected,
      inReview: taskStats.inReview
    });
    
    // If approved, simulate pushing to production
    if (newStatus === 'approved') {
      try {
        setProcessingMessage(`Pushing changes for task #${taskId} to production...`);
        await pushToProduction(taskId);
        setProcessingMessage(`Task #${taskId} successfully deployed to production!`);
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingMessage('');
        }, 2000);
      } catch (error) {
        console.error('Error pushing to production:', error);
        setProcessingMessage(`Error deploying task #${taskId} to production.`);
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingMessage('');
        }, 2000);
      }
    }
  };

  const handleSelectTask = (taskId: number, selected: boolean) => {
    if (selected) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleSelectAllInGroup = (groupName: string, selected: boolean) => {
    const groupTasks = filteredTasks.filter(task => {
      if (groupBy === 'Category') return task.Category === groupName;
      if (groupBy === 'Recommended AI Agent') return task['Recommended AI Agent'] === groupName;
      if (groupBy === 'Field Name') return task['Field Name'] === groupName;
      if (groupBy === 'status') return task.status === groupName;
      return false;
    });
    
    const groupTaskIds = groupTasks.map(task => task.id);
    
    if (selected) {
      // Add all tasks in group that aren't already selected
      const newSelectedTasks = [...selectedTasks];
      groupTaskIds.forEach(id => {
        if (!newSelectedTasks.includes(id)) {
          newSelectedTasks.push(id);
        }
      });
      setSelectedTasks(newSelectedTasks);
    } else {
      // Remove all tasks in group
      setSelectedTasks(selectedTasks.filter(id => !groupTaskIds.includes(id)));
    }
  };

  const handleBatchApprove = async () => {
    // Only update pending tasks
    const pendingSelectedTaskIds = tasks
      .filter(task => selectedTasks.includes(task.id) && task.status === 'pending')
      .map(task => task.id);
    
    if (pendingSelectedTaskIds.length === 0) return;
    
    setIsProcessing(true);
    setProcessingMessage(`Processing batch approval for ${pendingSelectedTaskIds.length} tasks...`);
    
    const updatedTasks = batchUpdateTaskStatusWithHistory(
      tasks, 
      pendingSelectedTaskIds, 
      'approved',
      'Batch approval',
      'current-user'
    );
    setTasks(updatedTasks);
    
    const updatedFilteredTasks = batchUpdateTaskStatusWithHistory(
      filteredTasks, 
      pendingSelectedTaskIds, 
      'approved',
      'Batch approval',
      'current-user'
    );
    setFilteredTasks(updatedFilteredTasks);
    
    // Update stats
    const taskStats = getTaskStats(updatedTasks);
    setStats({
      total: taskStats.total,
      pending: taskStats.pending,
      approved: taskStats.approved,
      rejected: taskStats.rejected,
      inReview: taskStats.inReview
    });
    
    // Simulate pushing to production
    try {
      setProcessingMessage(`Pushing ${pendingSelectedTaskIds.length} tasks to production...`);
      await batchPushToProduction(pendingSelectedTaskIds);
      setProcessingMessage(`${pendingSelectedTaskIds.length} tasks successfully deployed to production!`);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error pushing to production:', error);
      setProcessingMessage(`Error deploying tasks to production.`);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
      }, 2000);
    }
    
    // Clear selection
    setSelectedTasks([]);
  };

  const handleBatchReject = () => {
    // Only update pending tasks
    const pendingSelectedTaskIds = tasks
      .filter(task => selectedTasks.includes(task.id) && task.status === 'pending')
      .map(task => task.id);
    
    if (pendingSelectedTaskIds.length === 0) return;
    
    const updatedTasks = batchUpdateTaskStatusWithHistory(
      tasks, 
      pendingSelectedTaskIds, 
      'rejected',
      'Batch rejection',
      'current-user'
    );
    setTasks(updatedTasks);
    
    const updatedFilteredTasks = batchUpdateTaskStatusWithHistory(
      filteredTasks, 
      pendingSelectedTaskIds, 
      'rejected',
      'Batch rejection',
      'current-user'
    );
    setFilteredTasks(updatedFilteredTasks);
    
    // Update stats
    const taskStats = getTaskStats(updatedTasks);
    setStats({
      total: taskStats.total,
      pending: taskStats.pending,
      approved: taskStats.approved,
      rejected: taskStats.rejected,
      inReview: taskStats.inReview
    });
    
    // Clear selection
    setSelectedTasks([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center app-header">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Task Manager</h1>
          <p className="mt-2">Review and approve AI agent tasks before they are pushed to production</p>
        </div>
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showHistory ? 'Hide History' : 'View Approval History'}
          </button>
        </div>
      </div>
      
      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-700">{processingMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Approval History */}
      {showHistory ? (
        <ApprovalHistory onClose={() => setShowHistory(false)} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="stats-card">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="stats-card">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.pending}</p>
            </div>
            <div className="stats-card">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.approved}</p>
            </div>
            <div className="stats-card">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="mt-1 text-3xl font-semibold text-red-600">{stats.rejected}</p>
            </div>
            <div className="stats-card">
              <p className="text-sm font-medium text-gray-500">In Review</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">{stats.inReview}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="filter-section">
            <FilterBar
              categories={categories}
              agents={agents}
              onFilterChange={handleFilterChange}
              onGroupByChange={setGroupBy}
              selectedGroupBy={groupBy}
              onBatchApprove={handleBatchApprove}
              onBatchReject={handleBatchReject}
              hasSelectedTasks={selectedTasks.length > 0}
            />
          </div>
          
          {/* Task List */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              groupBy={groupBy}
              onViewDetails={setSelectedTask}
              onStatusChange={handleStatusChange}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
              onSelectAllInGroup={handleSelectAllInGroup}
            />
          )}
        </>
      )}
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

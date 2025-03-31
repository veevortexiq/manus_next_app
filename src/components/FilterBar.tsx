import { GroupByOption, Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';

interface FilterBarProps {
  categories: string[];
  agents: string[];
  onFilterChange: (filters: {
    category?: string;
    agent?: string;
    status?: TaskStatus;
    search?: string;
  }) => void;
  onGroupByChange: (groupBy: GroupByOption | null) => void;
  selectedGroupBy: GroupByOption | null;
  onBatchApprove: () => void;
  onBatchReject: () => void;
  hasSelectedTasks: boolean;
}

export default function FilterBar({
  categories,
  agents,
  onFilterChange,
  onGroupByChange,
  selectedGroupBy,
  onBatchApprove,
  onBatchReject,
  hasSelectedTasks
}: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [agent, setAgent] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onFilterChange({ category, agent, status: status as TaskStatus, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    onFilterChange({ category: e.target.value, agent, status: status as TaskStatus, search });
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgent(e.target.value);
    onFilterChange({ category, agent: e.target.value, status: status as TaskStatus, search });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as TaskStatus | '');
    onFilterChange({ category, agent, status: e.target.value as TaskStatus, search });
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as GroupByOption | '';
    onGroupByChange(value ? value as GroupByOption : null);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" className="text-gray-900 bg-white">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="text-gray-900 bg-white">{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-1">
            AI Agent
          </label>
          <select
            id="agent"
            value={agent}
            onChange={handleAgentChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" className="text-gray-900 bg-white">All Agents</option>
            {agents.map(a => (
              <option key={a} value={a} className="text-gray-900 bg-white">{a}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" className="text-gray-900 bg-white">All Statuses</option>
            <option value="pending" className="text-gray-900 bg-white">Pending</option>
            <option value="approved" className="text-gray-900 bg-white">Approved</option>
            <option value="rejected" className="text-gray-900 bg-white">Rejected</option>
            <option value="in_review" className="text-gray-900 bg-white">In Review</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">
            Group By
          </label>
          <select
            id="groupBy"
            value={selectedGroupBy || ''}
            onChange={handleGroupByChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="" className="text-gray-900 bg-white">No Grouping</option>
            <option value="Category" className="text-gray-900 bg-white">Category</option>
            <option value="Recommended AI Agent" className="text-gray-900 bg-white">AI Agent</option>
            <option value="Field Name" className="text-gray-900 bg-white">Field Name</option>
            <option value="status" className="text-gray-900 bg-white">Status</option>
          </select>
        </div>
      </div>
      
      {hasSelectedTasks && (
        <div className="mt-4 pt-4 border-t flex justify-end space-x-3">
          <button
            onClick={onBatchReject}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 btn-danger"
          >
            Reject Selected
          </button>
          <button
            onClick={onBatchApprove}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 btn-success"
          >
            Approve Selected
          </button>
        </div>
      )}
    </div>
  );
}

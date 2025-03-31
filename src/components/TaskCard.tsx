import { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onViewDetails: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  selected: boolean;
  onSelect: (taskId: number, selected: boolean) => void;
}

export default function TaskCard({ 
  task, 
  onViewDetails, 
  onStatusChange, 
  selected, 
  onSelect 
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 status-badge-approved';
      case 'rejected': return 'bg-red-100 text-red-800 status-badge-rejected';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 status-badge-in-review';
      default: return 'bg-blue-100 text-blue-800 status-badge-pending';
    }
  };
  
  const getAgentColor = (agent: string) => {
    if (agent.includes('SEO')) return 'border-l-blue-500';
    if (agent.includes('Merchandising')) return 'border-l-purple-500';
    if (agent.includes('Brand')) return 'border-l-amber-500';
    if (agent.includes('Image')) return 'border-l-green-500';
    if (agent.includes('UX')) return 'border-l-pink-500';
    if (agent.includes('Conversion')) return 'border-l-cyan-500';
    return 'border-l-gray-500';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`task-card ${getAgentColor(task['Recommended AI Agent'])} 
        ${selected ? 'task-card-selected' : ''} 
        transition-all duration-200 hover:shadow-md`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(task.id, e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{task['Field Name']}</h3>
            <p className="text-sm text-gray-500">{task['Trigger Condition']}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-700 line-clamp-2">{task['Suggested Automation Task']}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {task['Category']}
          </span>
          <span className="ml-2 text-xs text-gray-500">{formatDate(task.timestamp)}</span>
        </div>
        
        <div className="flex space-x-2">
          {isHovered && (
            <>
              {task.status === 'pending' && (
                <>
                  <button 
                    onClick={() => onStatusChange(task.id, 'approved')}
                    className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 btn-success"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onStatusChange(task.id, 'rejected')}
                    className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 btn-danger"
                  >
                    Reject
                  </button>
                </>
              )}
            </>
          )}
          <button 
            onClick={() => onViewDetails(task)}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 btn-secondary"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

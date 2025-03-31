import { Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

export default function TaskDetail({ task, onClose, onStatusChange }: TaskDetailProps) {
  const [comment, setComment] = useState('');
  
  if (!task) return null;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Field Name</p>
                      <p className="mt-1">{task['Field Name']}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Trigger Condition</p>
                      <p className="mt-1">{task['Trigger Condition']}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="mt-1">{task['Category']}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">AI Agent</p>
                      <p className="mt-1">{task['Recommended AI Agent']}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="mt-1">{formatDate(task.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Agent Work Log</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ol className="space-y-2 list-decimal list-inside">
                    {task.steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Suggested Automation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{task['Suggested Automation Task']}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Before / After Comparison</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Before</p>
                    <p className="text-gray-700">{task.before}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">After</p>
                    <p className="text-gray-700">{task.after}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Staging Preview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <a 
                    href={task.stagingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span>View on staging</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add Comment</h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your comments or feedback here..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          
          {task.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  onStatusChange(task.id, 'rejected');
                  onClose();
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  onStatusChange(task.id, 'approved');
                  onClose();
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { TaskHistoryEntry, getAllTaskHistory, getApprovalStats } from '@/lib/approvalUtils';

interface ApprovalHistoryProps {
  onClose: () => void;
}

export default function ApprovalHistory({ onClose }: ApprovalHistoryProps) {
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [stats, setStats] = useState({
    totalChanges: 0,
    approvals: 0,
    rejections: 0,
    reviews: 0,
    approvalRate: 0
  });

  useEffect(() => {
    // Get all history entries
    const historyData = getAllTaskHistory();
    setHistory(historyData);
    
    // Get approval statistics
    const approvalStats = getApprovalStats();
    setStats(approvalStats);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Approval History</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Changes</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalChanges}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Approvals</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">{stats.approvals}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Rejections</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{stats.rejections}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Reviews</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600">{stats.reviews}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Approval Rate</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.approvalRate.toFixed(1)}%</p>
        </div>
      </div>
      
      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Previous Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No history entries found
                </td>
              </tr>
            ) : (
              history.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{entry.taskId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(entry.previousStatus)}`}>
                      {entry.previousStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(entry.newStatus)}`}>
                      {entry.newStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.comment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.userId || 'System'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

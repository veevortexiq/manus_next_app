import { Task, TaskStatus, GroupByOption } from '@/lib/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  groupBy: GroupByOption | null;
  onViewDetails: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  selectedTasks: number[];
  onSelectTask: (taskId: number, selected: boolean) => void;
  onSelectAllInGroup: (groupName: string, selected: boolean) => void;
}

export default function TaskList({
  tasks,
  groupBy,
  onViewDetails,
  onStatusChange,
  selectedTasks,
  onSelectTask,
  onSelectAllInGroup
}: TaskListProps) {
  if (!tasks.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No tasks found matching your criteria</p>
      </div>
    );
  }

  if (!groupBy) {
    return (
      <div className="space-y-4">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onViewDetails={onViewDetails}
            onStatusChange={onStatusChange}
            selected={selectedTasks.includes(task.id)}
            onSelect={onSelectTask}
          />
        ))}
      </div>
    );
  }

  // Group tasks
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach(task => {
    const groupValue = task[groupBy] as string;
    if (!groupedTasks[groupValue]) {
      groupedTasks[groupValue] = [];
    }
    groupedTasks[groupValue].push(task);
  });

  return (
    <div className="space-y-8">
      {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
        <div key={groupName} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={groupTasks.every(task => selectedTasks.includes(task.id))}
                onChange={(e) => onSelectAllInGroup(groupName, e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <h3 className="ml-3 font-medium text-gray-900">{groupName}</h3>
              <span className="ml-2 text-sm text-gray-500">({groupTasks.length} tasks)</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => groupTasks.forEach(task => {
                  if (task.status === 'pending') onStatusChange(task.id, 'approved');
                })}
                className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
              >
                Approve All
              </button>
              <button 
                onClick={() => groupTasks.forEach(task => {
                  if (task.status === 'pending') onStatusChange(task.id, 'rejected');
                })}
                className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Reject All
              </button>
            </div>
          </div>
          <div className="p-4 bg-white">
            <div className="space-y-4">
              {groupTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={onViewDetails}
                  onStatusChange={onStatusChange}
                  selected={selectedTasks.includes(task.id)}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

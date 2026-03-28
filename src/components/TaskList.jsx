import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onDelete, onTimeUpdate }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '2rem', animation: 'mesh 5s infinite' }}>[ NO ACTIVE DIRECTIVES ]</div>
        <p>SYSTEM AWAITING INPUT...</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pWeight = { high: 3, medium: 2, low: 1 };
    return pWeight[b.priority] - pWeight[a.priority];
  });

  return (
    <ul className="task-list">
      {sortedTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={onToggle} 
          onDelete={onDelete} 
          onTimeUpdate={onTimeUpdate}
        />
      ))}
    </ul>
  );
}

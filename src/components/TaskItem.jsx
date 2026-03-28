import { useState, useEffect } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onTimeUpdate }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // seconds tracked in this session

  useEffect(() => {
    let interval = null;
    if (isActive && !task.completed) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, task.completed]);

  const handleTimerToggle = () => {
    if (isActive) {
      // Pause: Save accumulated session time to global state & reset local counter.
      onTimeUpdate(task.id, sessionTime);
      setSessionTime(0);
      setIsActive(false);
    } else {
      // Start
      setIsActive(true);
    }
  };

  const totalSpent = (task.timeSpent || 0) + sessionTime;
  
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input 
        type="checkbox" 
        className="task-checkbox" 
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      
      <div className="task-content">
        <span className="task-text">{task.text}</span>
        
        <div className="task-meta">
          {task.priority !== 'low' && (
            <span className={`badge prio-${task.priority}`}>
              [{task.priority.toUpperCase()}]
            </span>
          )}
          {task.dueDate && (
            <span className="badge due-date">
              DUE: {formatDate(task.dueDate)}
            </span>
          )}
          {task.estimatedTime > 0 && (
            <span className="badge" style={{ color: '#00aa00' }}>
              EST: {task.estimatedTime}m
            </span>
          )}
          
          <div className="timer-section">
            <span style={{ color: isActive ? '#00f3ff' : '#00aa00' }}>
              TIME: {formatTime(totalSpent)}
            </span>
            {!task.completed && (
              <button 
                className={`timer-btn ${isActive ? 'active' : ''}`} 
                onClick={handleTimerToggle}
                aria-label={isActive ? 'Pause Flow' : 'Start Flow'}
              >
                {isActive ? '|| PAUSE' : '>> FOCUS'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button onClick={() => onDelete(task.id)} aria-label="Uninstall Task">
          [ DEL ]
        </button>
      </div>
    </li>
  );
}

import { useState } from 'react';

export default function TaskInput({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(''); // in minutes

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim(), priority, dueDate, parseInt(estimatedTime) || 0);
      setText('');
      setPriority('low');
      setDueDate('');
      setEstimatedTime('');
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="input-row">
        <input 
          type="text" 
          className="task-input" 
          placeholder="> TYPE NEW TASK COMMAND..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="add-btn" disabled={!text.trim()} aria-label="Add Task">
          EXECUTE
        </button>
      </div>
      <div className="input-row">
        <select 
          className="option-select" 
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">PRIO: LOW</option>
          <option value="medium">PRIO: MED</option>
          <option value="high">PRIO: HIGH</option>
        </select>
        <input 
          type="date" 
          className="date-input" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)}
          title="Due Date"
        />
        <input 
          type="number" 
          className="date-input" 
          placeholder="EST. MINUTES" 
          value={estimatedTime}
          onChange={(e) => setEstimatedTime(e.target.value)}
          min="1"
        />
      </div>
    </form>
  );
}

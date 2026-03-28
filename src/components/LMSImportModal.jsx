import { useState } from 'react';

export default function LMSImportModal({ onClose, onImport }) {
  const [logs, setLogs] = useState('');

  const parseText = () => {
    const lines = logs.split('\n').filter(l => l.trim().length > 0);
    const newTasks = lines.map((line, idx) => {
      // Extremely simple parser for "hacking" raw text. Every line = one task.
      let priority = 'medium';
      let title = line.trim();
      let due = '';
      
      // Auto-identify priority if word mentioned
      if (line.toLowerCase().includes('urgent') || line.toLowerCase().includes('important')) priority = 'high';
      
      return {
        id: `lms-${Date.now()}-${idx}`,
        text: `[LMS_SYNC] ${title}`,
        completed: false,
        priority: priority,
        dueDate: due,
        estimatedTime: 0,
        timeSpent: 0
      };
    });

    onImport(newTasks);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>&gt; INITIATE LMS SYNC</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Paste raw events from your LMS below. System will parse 1 task per line automatically.
        </p>
        <textarea 
          placeholder="PASTE DATA HERE..."
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
        ></textarea>
        <div className="modal-actions">
          <button className="add-btn" style={{ background: 'transparent' }} onClick={onClose}>
            CANCEL
          </button>
          <button className="add-btn" onClick={parseText}>
            EXECUTE SYNC
          </button>
        </div>
      </div>
    </div>
  );
}

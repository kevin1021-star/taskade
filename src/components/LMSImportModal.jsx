import { useState, useRef } from 'react';

export default function LMSImportModal({ onClose, onImport }) {
  const [logs, setLogs] = useState('');
  const fileInputRef = useRef(null);

  const parseText = () => {
    const lines = logs.split('\n').filter(l => l.trim().length > 0);
    const newTasks = lines.map((line, idx) => {
      let priority = 'medium';
      let title = line.trim();
      
      if (line.toLowerCase().includes('urgent') || line.toLowerCase().includes('important')) priority = 'high';
      
      return {
        id: `lms-${Date.now()}-${idx}`,
        text: `[LMS_SYNC] ${title}`,
        type: 'task',
        completed: false,
        priority: priority,
        dueDate: '',
        estimatedTime: 0,
        timeSpent: 0
      };
    });

    onImport(newTasks);
  };

  const parseICalDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const isUTC = dateStr.endsWith('Z');
      const clean = dateStr.replace(/[^0-9T]/g, '');
      if (clean.length >= 15) {
        const y = clean.substring(0,4), m = clean.substring(4,6), d = clean.substring(6,8);
        const h = clean.substring(9,11), mn = clean.substring(11,13), s = clean.substring(13,15);
        return new Date(`${y}-${m}-${d}T${h}:${mn}:${s}${isUTC ? 'Z' : ''}`).toISOString();
      } else if (clean.length >= 8) {
        const y = clean.substring(0,4), m = clean.substring(4,6), d = clean.substring(6,8);
        return new Date(`${y}-${m}-${d}T00:00:00`).toISOString();
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const icsData = event.target.result;
      const events = [];
      const lines = icsData.split(/\r?\n/);
      let currentEvent = null;

      for (let line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
          currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
          if (currentEvent && currentEvent.title) events.push(currentEvent);
          currentEvent = null;
        } else if (currentEvent) {
          if (line.startsWith('SUMMARY:')) currentEvent.title = line.substring(8);
          else if (line.startsWith('DTSTART')) currentEvent.start = parseICalDate(line.split(':')[1]);
          else if (line.startsWith('DTEND')) currentEvent.end = parseICalDate(line.split(':')[1]);
        }
      }

      const newMeetings = events.map((ev, idx) => ({
        id: `meet-${Date.now()}-${idx}`,
        text: `[CAL] ${ev.title}`,
        type: 'meeting',
        completed: false,
        priority: 'high', // meetings usually high priority
        dueDate: ev.start || new Date().toISOString(),
        dueEnd: ev.end || null,
        estimatedTime: 0,
        timeSpent: 0
      }));

      onImport(newMeetings);
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>&gt; INITIATE SYNC_LMS</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Upload a .ics calendar file to auto-import meetings, or paste raw text below to generate tasks.
        </p>
        
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed var(--text-dim)', textAlign: 'center' }}>
          <input 
            type="file" 
            accept=".ics" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button className="add-btn" style={{ fontSize: '1rem' }} onClick={() => fileInputRef.current.click()}>
            [+] UPLOAD .ICS FILE
          </button>
        </div>

        <textarea 
          placeholder="PASTE RAW TEXT HERE..."
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
        ></textarea>
        
        <div className="modal-actions">
          <button className="add-btn" style={{ background: 'transparent' }} onClick={onClose}>
            CANCEL
          </button>
          <button className="add-btn" onClick={parseText} disabled={!logs.trim()}>
            TEXT SYNC
          </button>
        </div>
      </div>
    </div>
  );
}

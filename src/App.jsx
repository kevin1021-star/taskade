import { useState, useEffect, useRef } from 'react';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import LMSImportModal from './components/LMSImportModal';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('hacker-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('All');
  const [showLMSModal, setShowLMSModal] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(() => {
    return parseInt(localStorage.getItem('hacker-focus-time')) || 0;
  }); // in seconds

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    localStorage.setItem('hacker-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hacker-focus-time', totalFocusTime.toString());
  }, [totalFocusTime]);

  // Global total focus timer updates triggered from individual TaskItems
  const addGlobalFocusTime = (seconds) => {
    setTotalFocusTime(prev => prev + seconds);
  };

  const addTask = (text, priority, dueDate, estimatedTime) => {
    setTasks([
      ...tasks, 
      { 
        id: Date.now().toString(), 
        text, 
        completed: false, 
        priority, 
        dueDate, 
        estimatedTime: estimatedTime || 0, // minutes
        timeSpent: 0 // seconds
      }
    ]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateTaskTimeSpent = (id, additionalSeconds) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, timeSpent: (t.timeSpent || 0) + additionalSeconds } : t));
    addGlobalFocusTime(additionalSeconds);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Active') return !t.completed;
    if (filter === 'Completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  const formatGlobalTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <>
      <div className="jarvis-hud-container">
        <div className="hud-wrapper">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="ring ring-4"></div>
          <div className="ring ring-5"></div>
          <div className="ring ring-center"></div>
        </div>
      </div>
      <div className="app-container">
        <div className="widget">
          <header className="header-panel">
          <h1 className="title">SYS.TASKS</h1>
          <div className="stats-panel">
            <div>ACTIVE: <span>{activeCount}</span></div>
            <div>TOTAL FOCUS: <span>{formatGlobalTime(totalFocusTime)}</span></div>
          </div>
        </header>

        <div className="actions-bar">
          <div className="filter-tabs">
            {['All', 'Active', 'Completed'].map(f => (
              <button 
                key={f} 
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                [{f.toUpperCase()}]
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`audio-toggle ${isPlaying ? 'playing' : ''}`} 
              onClick={toggleAudio}
            >
              UPLINK: {isPlaying ? '[ || PAUSE ]' : '[ ► PLAY ]'}
            </button>
            <button className="lms-btn" onClick={() => setShowLMSModal(true)}>
              &gt;_ SYNC_LMS
            </button>
          </div>
        </div>

        <audio ref={audioRef} src="https://coderadio-admin.freecodecamp.org/radio/8000/radio.mp3" preload="none"></audio>

        <TaskInput onAdd={addTask} />
        
        <TaskList 
          tasks={filteredTasks} 
          onToggle={toggleTask} 
          onDelete={deleteTask} 
          onTimeUpdate={updateTaskTimeSpent}
        />
      </div>

      {showLMSModal && (
        <LMSImportModal 
          onClose={() => setShowLMSModal(false)} 
          onImport={(lmsTasks) => {
            setTasks([...tasks, ...lmsTasks]);
            setShowLMSModal(false);
          }} 
        />
      )}
    </div>
    </>
  );
}

export default App;

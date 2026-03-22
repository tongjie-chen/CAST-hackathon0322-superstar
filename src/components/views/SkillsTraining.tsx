import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { logActivity } from '../../utils/activity';

type TrainingMode = 'Internship' | 'Career Switch' | 'Senior Progression' | null;
type Assignment = { title: string; jd: string; brief: string; timeline: string };
type ViewTab = 'Timeline' | 'Simulator' | 'Todo';
type Phase = { month: string, title: string, tasks: string[], topics: string[] };
type Todo = { id: string; text: string; completed: boolean; source?: string; timeline?: string };

export const SkillsTraining: React.FC = () => {
  const [career] = useState(localStorage.getItem('specificCareer') || localStorage.getItem('careerChoice'));
  const [activeTab, setActiveTab] = useState<ViewTab>(() => {
    const hashPart = window.location.hash.slice(2).split('/')[1];
    if (hashPart === 'roadmap') return 'Timeline';
    if (hashPart === 'simulator') return 'Simulator';
    if (hashPart === 'todo') return 'Todo';
    return 'Timeline';
  });

  useEffect(() => {
    const handleHash = () => {
      const parts = window.location.hash.slice(2).split('/');
      if (parts[0] === 'skills-training' && parts[1]) {
        if (parts[1] === 'roadmap') setActiveTab('Timeline');
        else if (parts[1] === 'simulator') setActiveTab('Simulator');
        else if (parts[1] === 'todo') setActiveTab('Todo');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const slug = activeTab === 'Timeline' ? 'roadmap' : activeTab === 'Simulator' ? 'simulator' : 'todo';
    const currentParts = window.location.hash.slice(2).split('/');
    if (currentParts[0] === 'skills-training' && currentParts[1] !== slug) {
      window.location.hash = `#/skills-training/${slug}`;
    }
  }, [activeTab]);

  const [phases, setPhases] = useState<Phase[]>([]);
  const [loadingPhases, setLoadingPhases] = useState(false);

  const [mode, setMode] = useState<TrainingMode>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  const [submission, setSubmission] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('userTodos') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('userTodos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (career) {
      setPhases([]); // Clear old roadmap when career changes
      fetchRoadmap(career);
    }
  }, [career]);

  const fetchRoadmap = async (targetCareer: string) => {
    setLoadingPhases(true);
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");

      const payload = {
        systemInstruction: { parts: [{ text: "Return exactly 3 phases as a strict JSON array format: [{ \"month\": \"Month 1\", \"title\": \"...\", \"tasks\": [\"...\", \"...\"], \"topics\": [\"...\", \"...\"] }]. No markdown formatting block." }] },
        contents: [{ role: 'user', parts: [{ text: `Generate a 3-month skill ramp-up roadmap tailored specifically for a ${targetCareer}. 
        Provide 3 HIGHLY SPECIFIC tasks per phase. Each task MUST include a real-world resource, book title, tool name, or course (e.g., 'Master Python via the University of Michigan Coursera Specialization', 'Read Designing Data-Intensive Applications by Martin Kleppmann').
        Also provide 3 core technical topics/skills to master in this phase.
        Avoid generic phrases. Be extremely specific to ${targetCareer}.` }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Format error");
      setPhases(parsed);
      logActivity({ type: 'roadmap', title: 'Roadmap Generated', desc: `Personalized 3-month plan for ${targetCareer}.` });
    } catch(err) {
      setPhases([
        { month: 'Month 1', title: 'Core Fundamentals', tasks: ['Online Courses', 'Domain Literature', 'Tool Familiarization'], topics: ['Basics', 'Industry Standards'] },
        { month: 'Month 2', title: 'Advanced Concepts', tasks: ['Mock Assessments', 'Case Studies', 'Networking'], topics: ['Complexity', 'Systems Design'] },
        { month: 'Month 3', title: 'Interview & Execution', tasks: ['Portfolio Building', 'Live Interviews', 'Negotiation Polish'], topics: ['Presentation', 'Negotiation'] }
      ]);
    } finally {
      setLoadingPhases(false);
    }
  };

  const startTraining = async (selectedMode: TrainingMode) => {
    setMode(selectedMode);
    setLoadingAssignment(true);
    setFeedback(null);
    setSubmission('');
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");

      const prompt = `Act as an elite corporate recruiter for a ${selectedMode} role in ${career}. 
      Source a realistic, famous, or public case study/assignment from top-tier companies in this field (e.g., McKinsey's public case reviews, Google's APM design challenges, or a major bank's research report task).
      Return a JSON object with exactly these keys: 
      "title": The name of the case study or assignment (e.g., "McKinsey Profitability Framework Case").
      "jd": A brief description of the role and why this specific case study evaluates the necessary skills.
      "brief": The highly detailed, real-world assignment prompt, including the company context, the specific problem to solve, and the strict deliverables.
      "timeline": A suggested timeline for completion (e.g., "Take 45 minutes to draft your response").
      No markdown, pure JSON only.`;

      const payload = {
        systemInstruction: { parts: [{ text: "Return only raw JSON. Example: {\"title\":\"...\",\"jd\":\"...\",\"brief\":\"...\",\"timeline\":\"...\"}" }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      };

      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      setAssignment(JSON.parse(text));
    } catch(err) {
      console.error(err);
      setAssignment({
        title: `${selectedMode} - ${career} Track`,
        jd: "Join our fast-paced company to drive innovation forward. You'll collaborate with cross-functional teams and execute high-impact strategies.",
        brief: "Create a 300-word proposal addressing how you would optimize our onboarding metrics over a 30-day timeline.",
        timeline: "Take 45 minutes to draft your response."
      });
    } finally {
      setLoadingAssignment(false);
    }
  };

  const submitAssignment = async () => {
    if (!submission.trim()) return;
    setLoadingFeedback(true);
    try {
       const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
       const payload = {
        systemInstruction: { parts: [{ text: "You are a strict hiring manager evaluating a Candidate's assignment submission. Give actionable, constructive formatting using Markdown. Be brief, specific, and rate it out of 10." }] },
        contents: [{ role: 'user', parts: [{ text: `Evaluate this career-defining submission for a ${career} (${mode}) role. 
          The task was: ${assignment?.brief}.
          Candidate Submission: "${submission}"
          
          Provide a highly critical, professional review. 
          Use exactly these sections:
          ## 🎯 Strategic Impact
          ## 💡 Technical Refinement
          ## 🚀 Hiring Manager's Verdict (Score X/10)
          
          Use clinical, corporate language.` }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
      const data = await response.json();
      const fb = data?.candidates?.[0]?.content?.parts?.[0]?.text || "The AI evaluator reviewed your submission but did not provide a detailed text response. Please try reframing your answer.";
      setFeedback(fb);
      logActivity({ type: 'simulator', title: 'Simulator Task Reviewed', desc: `Hiring Manager feedback received for ${assignment?.title}.` });
    } catch(err) {
      setFeedback("Excellent work. Solid theoretical framework, though you could have added more quantitative success metrics. Rating: 8/10.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const downloadCalendar = () => {
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('T')[0];
    const addMonths = (date: Date, months: number) => { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; };
    const currDate = new Date();

    let dynamicIcs = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Career Mentor//EN\n";
    phases.forEach((phase, i) => {
      const start = addMonths(currDate, i);
      const end = addMonths(currDate, i + 1);
      dynamicIcs += `BEGIN:VEVENT\nSUMMARY:${career} - ${phase.title}\nDTSTART;VALUE=DATE:${formatDate(start)}\nDTEND;VALUE=DATE:${formatDate(end)}\nDESCRIPTION:${phase.tasks.join(', ')}\nEND:VEVENT\n`;
    });
    dynamicIcs += "END:VCALENDAR";

    const blob = new Blob([dynamicIcs], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'training_roadmap.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTodo = (text: string, timeline?: string) => {
    if (todos.some(t => t.text === text)) return; // Prevent duplicates
    const newTodo: Todo = { id: Math.random().toString(36).substr(2, 9), text, completed: false, timeline };
    setTodos(prev => [newTodo, ...prev]);
  };

  const exportTodos = () => {
    const header = `# Learning Curriculum Tasks - ${career}\n\n`;
    const body = todos.map(t => `${t.completed ? '[x]' : '[ ]'} ${t.text}${t.timeline ? ` (${t.timeline})` : ''}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `curriculum_tasks_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;
    if (newCompleted) {
      logActivity({ type: 'simulator', title: 'Task Completed', desc: `Finished: ${todo.text}` });
    }

    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Skills & Development</h1>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
          {(['Timeline', 'Simulator', 'Todo'] as ViewTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '1rem 2rem', cursor: 'pointer', fontSize: '1rem', fontWeight: activeTab === tab ? 600 : 500,
                borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent', transition: 'var(--transition-fast)'
              }}
            >
              {tab === 'Timeline' ? 'Roadmap Timeline' : tab === 'Simulator' ? 'Project Simulator' : 'Learning Tasks'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'Timeline' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
            <p className="text-muted" style={{ fontSize: '1.125rem', margin: 0 }}>Your customized 3-month ramp-up plan for {career || 'your future'}.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => career && fetchRoadmap(career)} disabled={loadingPhases} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>{loadingPhases ? 'Regenerating...' : 'Regenerate Roadmap'}</button>
              <button onClick={downloadCalendar} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>Download to Calendar</button>
            </div>
          </div>
          
          {loadingPhases ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
               <p className="text-muted animate-pulse">Vertex AI is building a robust 3-month roadmap for {career}...</p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {phases.map((phase, i) => (
                <div key={i} style={{ padding: '2rem', background: 'var(--chat-ai-bg)', borderLeft: '4px solid', borderLeftColor: i === 0 ? '#6366f1' : i === 1 ? '#10b981' : '#f43f5e', borderRadius: '0 1rem 1rem 0' }}>
                  <h3 className="heading text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{phase.month}: {phase.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <p className="text-muted" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Actionable Tasks & Resources</p>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {phase.tasks.map((task, j) => (
                          <li key={j} style={{ position: 'relative', paddingRight: '2rem' }}>
                            {task}
                            <button 
                              onClick={() => addTodo(task, phase.month)}
                              title="Add to Todo List"
                              style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '1.25rem', opacity: 0.6 }}
                              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                            >+</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted" style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Key Topics to Master</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {phase.topics?.map((topic, j) => (
                          <span key={j} style={{ padding: '0.25rem 0.75rem', background: 'var(--input-bg)', borderRadius: '1rem', fontSize: '0.8125rem', border: '1px solid var(--panel-border)' }}>{topic}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside style={{ position: 'sticky', top: '0', background: 'var(--chat-ai-bg)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)' }}>
              <h3 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🎯</span> Master Skill Inventory
              </h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Core competencies you'll acquire over the next 90 days as a <strong>{career}</strong>.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from(new Set(phases.flatMap(p => p.topics))).map((skill, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '0.75rem', border: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{skill}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Curriculum Strategy</p>
                <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>These skills are mapped to top-tier {career} roles at companies like Google, Meta, and Netflix.</p>
              </div>
            </aside>
          </div>
          )}
        </div>
      )}

      {activeTab === 'Simulator' && (
        <div className="animate-fade-in">
          {!career ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 className="heading text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Profile Found</h2>
              <p className="text-muted">Take the Assessment to unlock tailored Interactive Training modes.</p>
            </div>
          ) : !mode ? (
            <div>
              <p className="text-muted" style={{ fontSize: '1.125rem', marginBottom: '2rem', textAlign: 'center' }}>Ready to test your skills as a <strong>{career}</strong>? Choose your trajectory.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', margin: '0 auto' }}>
                <div onClick={() => startTraining('Internship')} className="hover-card" style={{ padding: '3rem 2rem', background: 'var(--chat-ai-bg)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Internship Project</h3>
                  <p className="text-muted">Simulate a high-impact internship case study designed for students.</p>
                </div>
                <div onClick={() => startTraining('Career Switch')} className="hover-card" style={{ padding: '3rem 2rem', background: 'var(--chat-ai-bg)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Career Switch Challenge</h3>
                  <p className="text-muted">Tackle an assignment designed for professionals pivoting laterally.</p>
                </div>
                <div onClick={() => startTraining('Senior Progression')} className="hover-card" style={{ padding: '3rem 2rem', background: 'var(--chat-ai-bg)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Senior Progression</h3>
                  <p className="text-muted">Take on complex scenarios and architectural challenges testing senior readiness.</p>
                </div>
              </div>
            </div>
          ) : loadingAssignment ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 className="heading text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Synthesizing Company Profile...</h2>
              <p className="text-muted animate-pulse">Vertex AI is constructing a tailored {mode} assignment for {career}...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem' }}>
                <div>
                   <h1 className="heading" style={{ fontSize: '2rem' }}>{assignment?.title}</h1>
                   <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                     <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: 'white', borderRadius: '1rem', fontSize: '0.875rem' }}>{mode} Track</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)' }}>✨ Generated by Vertex AI Gemini</span>
                   </div>
                </div>
                <button onClick={() => setMode(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Change Track</button>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h3 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Position Overview</h3>
                  <div className="markdown-body" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}><ReactMarkdown>{assignment?.jd || ''}</ReactMarkdown></div>
                </div>
                <div style={{ background: 'var(--chat-ai-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px dotted var(--accent-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <h3 className="heading" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--accent-color)' }}>Your Assignment</h3>
                     <span style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⏱️ {assignment?.timeline || 'Take 60 minutes'}</span>
                  </div>
                  <div className="markdown-body" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                    <ReactMarkdown>{assignment?.brief || ''}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {loadingFeedback ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--chat-ai-bg)', borderRadius: '1.5rem', border: '1px solid var(--panel-border)' }}>
                    <div className="animate-pulse">
                      <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Grader is Analyzing...</h3>
                      <p className="text-muted">Reviewing your strategic approach and quantifying impact...</p>
                    </div>
                  </div>
              ) : !feedback ? (
                  <div className="animate-fade-in">
                    <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submit Your Work</h3>
                    <textarea 
                      value={submission} onChange={e => setSubmission(e.target.value)} placeholder="Draft your solution here..." 
                      style={{ width: '100%', minHeight: '200px', padding: '1.5rem', borderRadius: '1rem', background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', outline: 'none', resize: 'vertical', fontSize: '1rem', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: '1rem' }}
                    />
                    <button 
                      onClick={submitAssignment} disabled={!submission.trim()}
                      style={{ background: 'var(--accent-gradient)', color: 'white', padding: '1rem 3rem', borderRadius: '2rem', border: 'none', fontWeight: 600, cursor: !submission.trim() ? 'not-allowed' : 'pointer' }}
                    >
                      Submit Assignment for Review
                    </button>
                  </div>
              ) : (
                <div className="animate-fade-in" style={{ padding: '2rem', background: 'var(--chat-ai-bg)', border: '1px solid #10b981', borderRadius: '1.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>👨‍💼</span>
                    <h3 className="heading" style={{ fontSize: '1.5rem', margin: 0, color: '#10b981' }}>Hiring Manager Feedback</h3>
                  </div>
                  <div className="markdown-body" style={{ color: 'var(--text-primary)' }}>
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                  <button onClick={() => {setFeedback(null); setSubmission('');}} style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', padding: '0.75rem 2rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>Try Another Submission</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Todo' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 className="heading" style={{ fontSize: '1.5rem', margin: 0 }}>Curriculum Task Manager</h2>
              <p className="text-muted">{todos.filter(t => t.completed).length} / {todos.length} items achieved</p>
            </div>
            <button onClick={exportTodos} style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Export as MD</button>
          </div>

          <div style={{ background: 'var(--chat-ai-bg)', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)' }}>
              <input 
                type="text" 
                placeholder="Add a custom task item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addTodo(e.currentTarget.value.trim(), 'Custom');
                    e.currentTarget.value = '';
                  }
                }}
                style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--panel-border)', padding: '1rem 1.5rem', borderRadius: '1rem', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {todos.map(todo => (
                <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--panel-border)', transition: 'var(--transition-fast)' }}>
                  <input 
                    type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} 
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-color)' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 500 }}>
                      {todo.text}
                    </span>
                    {todo.timeline && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-color)', marginTop: '0.25rem' }}>
                        📅 {todo.timeline}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)} 
                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', opacity: 0.4 }}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'}
                    onMouseOut={e => e.currentTarget.style.opacity = '0.4'}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <p className="text-muted" style={{ textAlign: 'center', padding: '3rem' }}>
                  No tasks assigned. Visit the Roadmap to populate your curriculum.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

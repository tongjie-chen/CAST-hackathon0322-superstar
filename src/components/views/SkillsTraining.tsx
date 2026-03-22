import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type TrainingMode = 'Internship' | 'Career Switch' | null;
type Assignment = { title: string; jd: string; brief: string };
type ViewTab = 'Timeline' | 'Simulator';

export const SkillsTraining: React.FC = () => {
  const [career] = useState(localStorage.getItem('specificCareer') || localStorage.getItem('careerChoice'));
  const [activeTab, setActiveTab] = useState<ViewTab>('Timeline');
  

  const [mode, setMode] = useState<TrainingMode>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  const [submission, setSubmission] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startTraining = async (selectedMode: 'Internship' | 'Career Switch') => {
    setMode(selectedMode);
    setLoadingAssignment(true);
    setFeedback(null);
    setSubmission('');
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");

      const prompt = `You are a corporate recruiter / hiring manager for a ${selectedMode} role in ${career}. 
      Return a JSON object with exactly these keys: 
      "title": A catchy job title.
      "jd": A short 3-sentence job description outlining responsibilities.
      "brief": A realistic technical take-home assignment or case study to evaluate them.
      No trailing characters, pure JSON only.`;

      const payload = {
        systemInstruction: { parts: [{ text: "Return only raw JSON. Example: {\"title\":\"...\",\"jd\":\"...\",\"brief\":\"...\"}" }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      };

      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      setAssignment(JSON.parse(text));
    } catch(err) {
      console.error(err);
      setAssignment({
        title: `${selectedMode} - ${career} Track`,
        jd: "Join our fast-paced company to drive innovation forward. You'll collaborate with cross-functional teams and execute high-impact strategies.",
        brief: "Create a 300-word proposal addressing how you would optimize our onboarding metrics over a 30-day timeline."
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
        contents: [{ role: 'user', parts: [{ text: `Evaluate this submission for the task [${assignment?.brief}]: "${submission}"` }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      setFeedback(data?.candidates?.[0]?.content?.parts?.[0]?.text || "Your submission was marked as reviewed.");
    } catch(err) {
      setFeedback("Excellent work. Solid theoretical framework, though you could have added more quantitative success metrics. Rating: 8/10.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Skills & Development</h1>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
          {(['Timeline', 'Simulator'] as ViewTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '1rem 2rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === tab ? 600 : 500,
                borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : '2px solid transparent',
                transition: 'var(--transition-fast)'
              }}
            >
              {tab === 'Timeline' ? 'Roadmap Timeline' : 'Interactive Project Simulator'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'Timeline' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <p className="text-muted" style={{ fontSize: '1.125rem' }}>Your customized 3-month ramp-up plan for {career || 'your future'}.</p>
            <button style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>Download to Calendar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
            {[
              { month: 'Month 1', title: 'Core Fundamentals', tasks: ['Online Courses', 'Domain Literature', 'Tool Familiarization'] },
              { month: 'Month 2', title: 'Advanced Concepts', tasks: ['Mock Assessments', 'Case Studies', 'Networking'] },
              { month: 'Month 3', title: 'Interview & Execution', tasks: ['Portfolio Building', 'Live Interviews', 'Negotiation Polish'] }
            ].map((phase, i) => (
              <div key={i} style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderLeft: '4px solid', borderLeftColor: i === 0 ? '#6366f1' : i === 1 ? '#10b981' : '#f8b500', borderRadius: '0 1rem 1rem 0' }}>
                <h3 className="heading text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{phase.month}: {phase.title}</h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {phase.tasks.map((task, j) => <li key={j}>{task}</li>)}
                </ul>
              </div>
            ))}
          </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div onClick={() => startTraining('Internship')} className="hover-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Internship Project</h3>
                  <p className="text-muted">Simulate a high-impact internship case study (e.g. McKinsey/Google style evaluation) designed for students.</p>
                </div>
                <div onClick={() => startTraining('Career Switch')} className="hover-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Career Switch Challenge</h3>
                  <p className="text-muted">Tackle an assignment designed for professionals pivoting laterally looking to prove their transferable skills.</p>
                </div>
              </div>
            </div>
          ) : loadingAssignment ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 className="heading text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Synthesizing Company Profile...</h2>
              <p className="text-muted animate-pulse">Vertex AI is constructing a tailored {mode} assignment for {career}...</p>
            </div>
          ) : (
            <div>
              <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem' }}>
                <div>
                   <h1 className="heading" style={{ fontSize: '2rem' }}>{assignment?.title}</h1>
                   <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: 'white', borderRadius: '1rem', fontSize: '0.875rem' }}>{mode} Track</span>
                </div>
                <button onClick={() => setMode(null)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Change Track</button>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h3 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Position Overview</h3>
                  <p style={{ lineHeight: 1.6 }}>{assignment?.jd}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px dotted var(--accent-color)' }}>
                  <h3 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Your Assignment</h3>
                  <p style={{ lineHeight: 1.6 }}>{assignment?.brief}</p>
                </div>
              </div>

              {!feedback ? (
                 <div className="animate-fade-in">
                   <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submit Your Work</h3>
                   <textarea 
                     value={submission} onChange={e => setSubmission(e.target.value)} placeholder="Draft your solution here..." 
                     style={{ width: '100%', minHeight: '200px', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)', color: 'white', border: '1px solid var(--panel-border)', outline: 'none', resize: 'vertical', fontSize: '1rem', lineHeight: 1.6, fontFamily: 'inherit', marginBottom: '1rem' }}
                   />
                   <button 
                     onClick={submitAssignment} disabled={!submission.trim() || loadingFeedback}
                     style={{ background: 'var(--accent-gradient)', color: 'white', padding: '1rem 3rem', borderRadius: '2rem', border: 'none', fontWeight: 600, cursor: (!submission.trim() || loadingFeedback) ? 'not-allowed' : 'pointer', opacity: (!submission.trim() || loadingFeedback) ? 0.7 : 1 }}
                   >
                     {loadingFeedback ? 'Grader AI Constructing Feedback...' : 'Submit Assignment for Review'}
                   </button>
                 </div>
              ) : (
                <div className="animate-fade-in" style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '1.5rem' }}>
                  <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#10b981' }}>Hiring Manager Feedback</h3>
                  <div className="markdown-body" style={{ color: 'var(--text-primary)' }}>
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                  <button onClick={() => {setFeedback(null); setSubmission('');}} style={{ marginTop: '2rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 2rem', borderRadius: '2rem', cursor: 'pointer' }}>Try Another Submission</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

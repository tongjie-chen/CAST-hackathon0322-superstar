import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'ai'; text: string };

export const CareerExploration: React.FC = () => {
  const [baseCareer] = useState(localStorage.getItem('careerChoice'));
  const [specificCareer, setSpecificCareer] = useState(localStorage.getItem('specificCareer'));
  const [options, setOptions] = useState<{title: string, desc: string}[] | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('careerExplorationChat');
    if (saved) return JSON.parse(saved);
    return [{ role: 'ai', text: "Hi! I'm your Career Coach. What kinds of activities do you enjoy doing in your free time, or what specific industry interests you?" }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (baseCareer && !specificCareer && !options && !loadingOptions) {
      fetchOptions(baseCareer);
    }
  }, [baseCareer, specificCareer, options, loadingOptions]);

  useEffect(() => {
    localStorage.setItem('careerExplorationChat', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const fetchOptions = async (career: string) => {
    setLoadingOptions(true);
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");

      const payload = {
        systemInstruction: { parts: [{ text: "Return exactly 3 specialized sub-career paths as a strict JSON array format: [{ \"title\": \"...\", \"desc\": \"...\" }]. No markdown formatting block." }] },
        contents: [{ role: 'user', parts: [{ text: `Generate 3 distinct market specializations for the overarching career: ${career}` }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      setOptions(parsed);
    } catch(err) {
      setOptions([
        { title: `Technical ${career}`, desc: "Focus heavily on internal systems architecture, API designs, and engineering collaboration." },
        { title: `Growth ${career}`, desc: "Drive user acquisition, retention metrics, and market experimental campaigns." },
        { title: `Data ${career}`, desc: "Leverage big data, analytics, and business intelligence to drive macro-decisions." }
      ]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const selectPath = (path: string) => {
    setSpecificCareer(path);
    localStorage.setItem('specificCareer', path);
    localStorage.setItem('careerChoice', path);
    window.dispatchEvent(new Event('storage'));
    
    const initialMsg = { role: 'ai' as const, text: `Great choice! Let's explore your path as a ${path}. What specific skills or companies are you most curious about?` };
    setMessages(prev => [...prev, initialMsg]);
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear your conversation history and re-select a path?')) {
      localStorage.removeItem('specificCareer');
      localStorage.removeItem('careerExplorationChat');
      setSpecificCareer(null);
      setOptions(null);
      setMessages([{ role: 'ai', text: "Hi! I'm your Career Coach. What kinds of activities do you enjoy doing in your free time, or what specific industry interests you?" }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      const history = messages.slice(1).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const payload = {
        systemInstruction: { parts: [{ text: `You are an expert Career Coach mentoring a ${specificCareer || baseCareer || 'Candidate'}. Discuss O*NET market trends and actionable guidance. Use Markdown.` }] },
        contents: history
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error connecting to AI: ${error?.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '2rem', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="heading" style={{ fontSize: '2.5rem' }}>Career Exploration AI</h1>
          <p className="text-muted" style={{ fontSize: '1.125rem' }}>Chat with your AI Career Coach about your path.</p>
        </div>
        <button onClick={clearChat} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
          Reset Session
        </button>
      </header>
      
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--panel-border)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1rem' }}>
          
          {loadingOptions && !specificCareer && (
             <div className="animate-fade-in" style={{ alignSelf: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1rem' }}>
               <span className="text-muted animate-pulse">Vertex AI is querying live {baseCareer} paths...</span>
             </div>
          )}

          {options && !specificCareer && !loadingOptions && (
            <div className="animate-fade-in" style={{ marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <p className="text-gradient" style={{ marginBottom: '1rem', fontWeight: 600 }}>We matched you with {baseCareer}. Select a specialization to deeply tailor your Coach:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {options.map((opt, idx) => (
                   <div key={idx} onClick={() => selectPath(opt.title)} className="hover-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--panel-border)', cursor: 'pointer' }}>
                     <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{opt.title}</h4>
                     <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                   </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-in" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{
                padding: '1rem 1.5rem', borderRadius: '1.25rem', borderTopLeftRadius: msg.role === 'ai' ? 0 : '1.25rem', borderTopRightRadius: msg.role === 'user' ? 0 : '1.25rem',
                background: msg.role === 'user' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)', color: 'white', border: msg.role === 'ai' ? '1px solid var(--panel-border)' : 'none', lineHeight: 1.5
              }}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="animate-fade-in" style={{ alignSelf: 'flex-start', padding: '1rem 1.5rem', borderRadius: '1.25rem', borderTopLeftRadius: 0, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--panel-border)' }}><span className="text-muted">Coach is analyzing...</span></div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..." 
            style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '2rem', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', fontSize: '1rem' }} 
          />
          <button 
            onClick={handleSend} disabled={!input.trim() || isTyping}
            style={{ padding: '0 2rem', borderRadius: '2rem', border: 'none', background: 'var(--accent-gradient)', color: 'white', cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (!input.trim() || isTyping) ? 0.7 : 1 }}
          >Send</button>
        </div>
      </div>
    </main>
  );
};

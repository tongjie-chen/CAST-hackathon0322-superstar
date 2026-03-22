import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'ai'; text: string };
type PrepTab = 'Mock Interview' | 'Resume AI' | 'Cover Letter Builder' | 'Salary Negotiation';

const MockInterviewChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mockInterviewChat');
    if (saved) return JSON.parse(saved);
    return [
      { role: 'ai', text: "Hello! I am your AI Interviewer. Please tell me about a time you had to resolve a conflict within your team. Use the STAR method." }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    localStorage.setItem('mockInterviewChat', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isTyping]);

  const clearChat = () => {
    if (confirm('Clear interview session?')) {
      const initial: Message[] = [{ role: 'ai', text: "Hello! I am your AI Interviewer. Please tell me about a time you had to resolve a conflict within your team. Use the STAR method." }];
      setMessages(initial);
      localStorage.setItem('mockInterviewChat', JSON.stringify(initial));
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
      if (!apiKey) throw new Error("API key is missing in .env file");
      
      const history = messages.slice(1).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const payload = {
        systemInstruction: { parts: [{ text: "You are an expert AI Interviewer. Evaluate the user's answer using the STAR method, give constructive feedback, and then ask the next behavioral question. Format using Markdown." }] },
        contents: history
      };

      const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: `Connection error: ${error?.message || 'Check API key.'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={clearChat} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>Clear Session</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1rem' }}>
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
        {isTyping && <div className="animate-fade-in" style={{ alignSelf: 'flex-start', padding: '1rem 1.5rem', borderRadius: '1.25rem', borderTopLeftRadius: 0, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--panel-border)' }}><span className="text-muted">Interviewer is typing...</span></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your answer..." style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '2rem', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }} />
        <button onClick={handleSend} disabled={!input.trim() || isTyping} style={{ padding: '0 2rem', borderRadius: '2rem', border: 'none', background: 'var(--accent-gradient)', color: 'white', cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (!input.trim() || isTyping) ? 0.7 : 1 }}>Send</button>
      </div>
    </div>
  );
};

const CoverLetterBuilder: React.FC = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!company.trim() || !role.trim()) return;
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key is missing in .env file");

      const payload = {
        systemInstruction: { parts: [{ text: "You are an expert career advisor. Write a professional, concise, modern cover letter for the requested role and company. Do not use markdown backticks, just output plain text ready for a textarea." }] },
        contents: [{ role: 'user', parts: [{ text: `Generate a cover letter for the role of ${role} at ${company}.` }] }]
      };

      const endpoint = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const data = await response.json();
      setDraft(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.");
    } catch (error) {
      setDraft("Error connecting to AI. Please verify API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: '500px' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Target Company Name" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
        <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Target Role Title" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
        <button onClick={handleGenerate} disabled={isGenerating || !company.trim() || !role.trim()} style={{ padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', background: 'var(--accent-gradient)', color: 'white', cursor: (isGenerating || !company.trim() || !role.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isGenerating ? 0.7 : 1 }}>
          {isGenerating ? 'Generating...' : 'Generate Initial Draft'}
        </button>
      </div>
      <textarea 
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Your generated cover letter will appear here..."
        style={{ flex: 1, padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', resize: 'none', fontSize: '1rem', lineHeight: 1.6, fontFamily: 'inherit' }} 
      />
    </div>
  );
};

const SalaryNegotiation: React.FC = () => {
  const [marketData, setMarketData] = useState<{level: string, range: string}[] | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchScript = async () => {
    setLoadingAction('script');
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");
      const payload = {
        systemInstruction: { parts: [{ text: "You are a career coach. Output the script formatted in markdown blockquotes." }] },
        contents: [{ role: 'user', parts: [{ text: "Generate a short, confident counter-offer email script for a candidate asking for a 15% increase highlighting specialized skills." }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const resData = await response.json();
      setScript(resData?.candidates?.[0]?.content?.parts?.[0]?.text || "Response empty.");
    } catch(err: any) {
      setScript(`Error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const fetchMarketData = async () => {
    setLoadingAction('data');
    setDataError(null);
    try {
      const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
      if (!apiKey) throw new Error("API key missing.");
      const payload = {
        systemInstruction: { parts: [{ text: "You are an analytics engine. Return ONLY a valid JSON array of objects with keys 'level' and 'range', no markdown formatting, no backticks. Example: [{\"level\": \"Entry Level\", \"range\": \"$70,000 - $95,000\"}]" }] },
        contents: [{ role: 'user', parts: [{ text: "Return current market salary insight brackets for Product Managers in Tech based on O*NET/Glassdoor data for Entry, Mid, and Senior levels." }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const resData = await response.json();
      let text = resData?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        setMarketData(parsed);
      } else {
        throw new Error("Invalid format received");
      }
    } catch(err: any) {
      setDataError(`Error parsing data: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 className="heading text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Market Insights</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Pull live market data for your target role metrics.</p>
        <button 
          onClick={fetchMarketData}
          disabled={!!loadingAction}
          style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: !!loadingAction ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}
        >
          {loadingAction === 'data' ? 'Pulling Data...' : 'Pull Live O*NET Data'}
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {dataError && <p style={{ color: '#f43f5e', fontSize: '0.875rem' }}>{dataError}</p>}
          {marketData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {marketData.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                  <span className="text-muted">{item.level}</span>
                  <span style={{ fontWeight: 600, color: i === 1 ? '#10b981' : 'inherit' }}>{item.range}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Script Generator</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Generate a professional script to counter-offer your current standing.</p>
        <button 
          onClick={fetchScript}
          disabled={!!loadingAction}
          style={{ width: '100%', padding: '1rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: !!loadingAction ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}
        >
          {loadingAction === 'script' ? 'Generating Script...' : 'Build Counter-Offer Context'}
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {script && <div className="markdown-body" style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}><ReactMarkdown>{script}</ReactMarkdown></div>}
        </div>
      </div>
    </div>
  );
};

export const InterviewPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PrepTab>('Mock Interview');

  const renderContent = () => {
    switch(activeTab) {
      case 'Mock Interview': return <MockInterviewChat />;
      case 'Resume AI': return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ border: '2px dashed rgba(99, 102, 241, 0.5)', borderRadius: '1.5rem', padding: '4rem 2rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.05)', cursor: 'pointer' }}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📄</span>
            <h3 className="heading" style={{ fontSize: '1.5rem' }}>Drag & Drop your Resume</h3>
            <p className="text-muted">PDF, DOCX formats supported. AI will analyze formatting, keywords, and impact.</p>
            <button style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Browse Files</button>
          </div>
        </div>
      );
      case 'Cover Letter Builder': return <CoverLetterBuilder />;
      case 'Salary Negotiation': return <SalaryNegotiation />;
      default: return null;
    }
  };

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '2rem', flexShrink: 0 }}>
        <h1 className="heading" style={{ fontSize: '2.5rem' }}>Interview Preparation</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem' }}>Mock interviews, resume feedback, cover letters, and salary negotiation.</p>
      </header>
      
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem', marginBottom: '2rem', overflowX: 'auto', flexShrink: 0 }}>
        {(['Mock Interview', 'Resume AI', 'Cover Letter Builder', 'Salary Negotiation'] as PrepTab[]).map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: activeTab === tab ? 'rgba(99, 102, 241, 0.2)' : 'transparent', 
              color: activeTab === tab ? 'white' : 'var(--text-secondary)', 
              border: activeTab === tab ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '2rem', 
              cursor: 'pointer', 
              fontWeight: activeTab === tab ? 600 : 500,
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </div>
    </main>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { logActivity } from '../../utils/activity';

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
        systemInstruction: { parts: [{ text: "Return exactly 3 unique, high-growth specialized sub-career paths as a strict JSON array format: [{ \"title\": \"...\", \"desc\": \"...\" }]. No markdown formatting block." }] },
        contents: [{ role: 'user', parts: [{ text: `Analyze the overarching career field: ${career}. 
        Generate 3 distinct, modern, and HIGHLY SPECIFIC market specializations. 
        Example for 'Product Management': ['Fintech Product Manager', 'AI/ML Product Lead', 'Growth Architect'].
        Example for 'Software Engineering': ['Cloud Infrastructure Engineer', 'Web3 Smart Contract Developer', 'Full-stack Performance Specialist'].
        Avoid generic terms like 'Technical', 'Growth', or 'Data' as standalone titles.` }] }]
      };
      const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("AI returned empty array");
      setOptions(parsed);
    } catch(err) {
      console.warn("AI Options fetch failed, using context-aware local mapping.");
      setOptions(calculateLocalOptions(career));
    } finally {
      setLoadingOptions(false);
    }
  };

  const calculateLocalOptions = (career: string) => {
    const lower = career.toLowerCase();
    if (lower.includes('engineer') || lower.includes('software') || lower.includes('tech')) {
      return [
        { title: "Cloud Infrastructure Engineer", desc: "Design and scale resilient systems on AWS/Azure/GCP." },
        { title: "Full-Stack Web Architect", desc: "Lead end-to-end development of modern, high-performance web applications." },
        { title: "AI Implementation Specialist", desc: "Integrate LLMs and machine learning models into production software." }
      ];
    }
    if (lower.includes('design') || lower.includes('creative') || lower.includes('art')) {
      return [
        { title: "Interaction Designer", desc: "Craft seamless, high-fidelity user experiences and interactive prototypes." },
        { title: "Visual Brand Strategist", desc: "Define the visual identity and aesthetic narrative for world-class products." },
        { title: "Design Systems Lead", desc: "Architect scalable, reusable UI components and documentation for large teams." }
      ];
    }
    if (lower.includes('product') || lower.includes('management') || lower.includes('lead')) {
      return [
        { title: "Growth Product Manager", desc: "Optimize conversion funnels, onboarding flows, and user retention metrics." },
        { title: "Technical Product Lead", desc: "Bridge the gap between business requirements and deep engineering constraints." },
        { title: "Platform Product Manager", desc: "Build internal tools and infrastructure that empower other product teams." }
      ];
    }
    // Default fallback if no match
    return [
      { title: `Specialized ${career} Lead`, desc: "Focus on vertical-specific leadership and high-impact strategy." },
      { title: `Operational ${career} Consultant`, desc: "Optimize internal workflows, efficiency, and scale." },
      { title: `Innovation ${career} Researcher`, desc: "Explore next-gen trends and experimental frameworks in this field." }
    ];
  };

  const selectPath = (path: string) => {
    setSpecificCareer(path);
    localStorage.setItem('specificCareer', path);
    localStorage.setItem('careerChoice', path); // Keep this line as it was in the original code
    // The user's snippet had localStorage.setItem('specificCareer', pathTitle); which is a typo and would overwrite the previous line.
    // Assuming pathTitle was meant to be 'path' for the logActivity call.
    logActivity({ type: 'exploration', title: 'Career Path Selected', desc: `Focused training on ${path} specialization.` });
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
      
      <div className="chat-container-refined" style={{ padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--panel-border)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--chat-ai-bg)', color: msg.role === 'user' ? 'var(--chat-user-text)' : 'var(--text-primary)', border: msg.role === 'ai' ? '1px solid var(--panel-border)' : 'none', lineHeight: 1.5
              }}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && <div className="animate-fade-in" style={{ alignSelf: 'flex-start', padding: '1rem 1.5rem', borderRadius: '1.25rem', borderTopLeftRadius: 0, background: 'var(--chat-ai-bg)', border: '1px solid var(--panel-border)' }}><span className="text-muted">Coach is analyzing...</span></div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..." 
            style={{ flex: 1, padding: '1rem 1.5rem', borderRadius: '2rem', border: '1px solid var(--panel-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' }} 
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

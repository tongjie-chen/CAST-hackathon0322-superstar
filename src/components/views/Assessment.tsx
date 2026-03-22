import React, { useState } from 'react';
import { logActivity } from '../../utils/activity';

const questions = [
  "I am energized by solving complex, abstract logical problems.",
  "I am comfortable making decisions with incomplete information.",
  "I prefer establishing clear processes over improvising.",
  "I excel at communicating technical concepts to non-technical people.",
  "I prioritize team harmony and emotional intelligence in the workplace.",
  "I enjoy working with data, charts, and quantitative metrics.",
  "I am highly persuasive and enjoy negotiating or selling ideas.",
  "I thrive in fast-paced, rapidly changing environments."
];

export const Assessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{personality: string, description: string, careerChoice: string} | null>(null);

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentStep]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const calculateResult = async () => {
    setIsGenerating(true);
    try {
       const apiKey = import.meta.env.VITE_VERTEX_AI_API_KEY;
       if (!apiKey) throw new Error("API key missing");
       
       const prompt = `Based on these 1-5 scalar answers (1=Strongly Disagree, 5=Strongly Agree) to these personality questions:
${questions.map((q, i) => `Q: "${q}"\nA: ${answers[i]}/5`).join('\n')}
Analyze the user's career personality across ALL industries (Engineering, Medicine, Arts, Finance, Marketing, etc.). DO NOT bias toward Product Management unless specifically supported by the answers. Return a strict JSON object:
{
  "personality": "Unique Archetype Name (e.g. 'The Visionary Architect', 'The Empathetic Healer')",
  "description": "2-3 sentences analyzing their specific working style, cognitive strengths, and ideal environment.",
  "careerChoice": "The singular best broad career category (e.g. 'Software Engineering', 'Biotechnology', 'UX Design', 'Investment Banking')"
}
Be diverse and accurate based ONLY on the provided answers.`;

       const payload = {
          systemInstruction: { parts: [{ text: "Return exactly one pure JSON object. No markdown, no backticks." }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
       };
       const response = await fetch(`https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, { method: 'POST', body: JSON.stringify(payload) });
       const data = await response.json();
       let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
       const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
       if (!parsed.careerChoice) throw new Error("Invalid format");
       setResult(parsed);
    } catch(err) {
      console.warn("AI Assessment failed, using local fallback mapping.");
      setResult(calculateLocalFallback());
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateLocalFallback = () => {
    const scores = {
      analytical: (answers[0] || 3) + (answers[5] || 3),  // Logical + Data
      leadership: (answers[1] || 3) + (answers[3] || 3),  // Decisions + Comms
      growth: (answers[6] || 3) + (answers[7] || 3),      // Persuasion + Fast-paced
      creative: (answers[4] || 3) + (answers[2] || 3),    // Harmony + Process (Organization)
    };

    const maxEntry = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    
    switch(maxEntry[0]) {
      case 'analytical':
        return {
          personality: "The Analytical Architect",
          description: "You excel at breaking down complex problems into logical components. Your strength lies in data-driven decision making and systems thinking.",
          careerChoice: "Software Engineering"
        };
      case 'leadership':
        return {
          personality: "The Strategic Lead",
          description: "A natural decision-maker who excels at bridge-building between teams. you thrive in high-stakes environments that require clear vision.",
          careerChoice: "Product Management"
        };
      case 'growth':
        return {
          personality: "The Dynamic Growth Hacker",
          description: "You are energized by fast-paced change and the art of persuasion. You excel at identifying opportunities and executing rapidly.",
          careerChoice: "Growth Marketing"
        };
      default:
        return {
          personality: "The Harmonious Planner",
          description: "You prioritize organizational health and clear processes. Your superpower is creating structured environments where teams can thrive.",
          careerChoice: "Operations Management"
        };
    }
  };

  const [isSaved, setIsSaved] = useState(false);
  const saveProfile = () => {
    localStorage.setItem('careerChoice', result?.careerChoice || 'Career Explorer');
    logActivity({
      type: 'assessment',
      title: 'Assessment Completed',
      desc: `Matched with ${result?.careerChoice || 'Career Explorer'} archetype.`
    });
    window.dispatchEvent(new Event('storage'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="heading" style={{ fontSize: '2.5rem' }}>Career Personality Assessment</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem' }}>Discover your strengths and get matched with ideal career paths.</p>
      </header>
      
      {!result ? (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '3rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="text-muted" style={{ fontWeight: 600 }}>Question {currentStep + 1} of {questions.length}</span>
            <span className="text-muted">{Math.round(((currentStep) / questions.length) * 100)}% Completed</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '3rem', overflow: 'hidden' }}>
            <div style={{ width: `${((currentStep) / questions.length) * 100}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'var(--transition-normal)' }} />
          </div>

          <h2 className="heading" style={{ fontSize: '1.75rem', marginBottom: '3rem', textAlign: 'center' }}>
            "{questions[currentStep]}"
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>Strongly Disagree</span>
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswer(val)}
                style={{
                  width: val === 3 ? '40px' : val === 1 || val === 5 ? '60px' : '50px',
                  height: val === 3 ? '40px' : val === 1 || val === 5 ? '60px' : '50px',
                  borderRadius: '50%',
                  border: `2px solid ${val < 3 ? '#f43f5e' : val > 3 ? '#10b981' : 'var(--text-secondary)'}`,
                  background: answers[currentStep] === val ? (val < 3 ? '#f43f5e' : val > 3 ? '#10b981' : 'var(--text-secondary)') : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
            <span style={{ color: '#10b981', fontWeight: 600 }}>Strongly Agree</span>
          </div>

          {currentStep === questions.length - 1 && Object.keys(answers).length === questions.length && (
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={calculateResult}
                disabled={isGenerating}
                style={{
                  background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '1rem 3rem', borderRadius: '2rem', fontSize: '1.125rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1, transition: 'var(--transition-fast)'
                }}
              >
                {isGenerating ? 'Analyzing Profiles...' : 'Generate My Career Profile'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '3rem', borderRadius: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🎯</span>
          </div>
          <h2 className="heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{result.personality}</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {result.description}
          </p>
          <div style={{ background: 'var(--chat-ai-bg)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid var(--panel-border)', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>         <p className="text-muted" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', fontWeight: 600 }}>Top Career Match</p>
             <h3 className="heading text-gradient" style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{result.careerChoice}</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer' }} onClick={() => { setCurrentStep(0); setAnswers({}); setResult(null); }}>Retake Assessment</button>
            <button onClick={saveProfile} style={{ background: isSaved ? '#10b981' : 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, transition: 'var(--transition-fast)' }}>
              {isSaved ? '✅ Saved!' : 'Save to My Profile'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

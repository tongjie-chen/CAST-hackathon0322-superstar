import React, { useState } from 'react';

const questions = [
  "I enjoy working in large teams to solve problems.",
  "I prefer to plan out all details before starting a project.",
  "I find it easy to adapt when plans change suddenly.",
  "I enjoy analyzing data to find logical solutions.",
  "I am comfortable taking the lead in a group setting."
];

export const Assessment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentStep]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const calculateResult = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setResult('ENTJ - The Commander. You are a strategic leader, driven to organize change. Top Career Matches: Product Manager, Management Consultant, Corporate Strategist.');
    }, 2000);
  };

  const saveProfile = () => {
    const choice = result?.includes('Product Manager') ? 'Product Management' : 'Career Explorer';
    localStorage.setItem('careerChoice', choice);
    window.dispatchEvent(new Event('storage'));
    alert('Profile saved! Check your badge in the bottom-left panel.');
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
          <h2 className="heading" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Assessment Complete!</h2>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '2rem' }}>
            {result}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={{ background: 'transparent', color: 'white', border: '1px solid var(--panel-border)', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer' }} onClick={() => { setCurrentStep(0); setAnswers({}); setResult(null); }}>Retake Assessment</button>
            <button onClick={saveProfile} style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600 }}>Save to My Profile</button>
          </div>
        </div>
      )}
    </main>
  );
};

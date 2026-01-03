
import React, { useState, useEffect, useRef } from 'react';
import { UserData, RefinementTone } from './types';
import { generateViralStrategy } from './services/geminiService';

// Enhanced Circular Progress Component
const ProgressRing: React.FC<{ radius: number; stroke: number; progress: number }> = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="inline-block">
      <circle
        stroke="rgba(255,255,255,0.2)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="progress-ring__circle transition-all duration-500 ease-out"
      />
    </svg>
  );
};

const QuestionCard: React.FC<{
  question: string;
  options?: string[];
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  isLoading?: boolean;
  currentStep: number;
  totalSteps: number;
}> = ({ question, options, placeholder, value, onChange, onNext, isLoading, currentStep, totalSteps }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl md:text-3xl font-bold leading-tight">{question}</h2>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Step {currentStep} of {totalSteps}</span>
        </div>
      </div>
      
      {options ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              disabled={isLoading}
              onClick={() => {
                onChange(opt);
                onNext();
              }}
              className={`py-3 px-6 rounded-xl border transition-all duration-200 text-left font-medium ${
                value === opt 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-indigo-400 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={value}
            disabled={isLoading}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === 'Enter' && value.trim() && !isLoading && onNext()}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-6 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
          />
          <button
            onClick={onNext}
            disabled={!value.trim() || isLoading}
            className={`relative overflow-hidden h-16 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
              isLoading 
                ? 'shimmer-btn cursor-wait shadow-indigo-500/40' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3 animate-in zoom-in duration-300">
                <div className="relative flex items-center justify-center text-white">
                  <ProgressRing radius={14} stroke={2.5} progress={percentage} />
                  <span className="absolute text-[7px] font-black">{percentage}%</span>
                </div>
                <span className="tracking-tight">Forging Viral Potential...</span>
              </div>
            ) : (
              <>
                <span>{currentStep === totalSteps ? 'Forge My Strategy' : 'Continue'}</span>
                <i className="fa-solid fa-arrow-right text-xs opacity-70 group-hover:translate-x-1 transition-transform"></i>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<number>(0);
  const [userData, setUserData] = useState<UserData>({
    platform: '',
    topic: '',
    audience: '',
    emotion: '',
    style: '',
    benefit: ''
  });
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = [
    {
      id: 'platform',
      q: "1. What type of video is this?",
      options: ["YouTube", "Shorts", "Reels", "TikTok"],
      placeholder: ""
    },
    {
      id: 'topic',
      q: "2. What is the main topic of the video?",
      options: undefined,
      placeholder: "e.g. AI tools, exam tips, fitness, tech review..."
    },
    {
      id: 'audience',
      q: "3. Who is the target audience?",
      options: ["Students", "Beginners", "Professionals", "Creators", "Everyone"],
      placeholder: ""
    },
    {
      id: 'emotion',
      q: "4. What is the key emotion you want to trigger?",
      options: ["Curiosity", "Shock", "Excitement", "Fear", "Inspiration", "Fun"],
      placeholder: ""
    },
    {
      id: 'style',
      q: "5. Is the video:",
      options: ["Educational", "Entertainment", "Story", "Tutorial", "Opinion"],
      placeholder: ""
    },
    {
      id: 'benefit',
      q: "6. What is ONE main benefit or surprise in the video?",
      options: undefined,
      placeholder: "e.g. Save time, secret trick, mistake people make..."
    }
  ];

  const handleNext = async () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
    
    if (step === questions.length) {
      await performGeneration();
    }
  };

  const performGeneration = async (tone?: RefinementTone) => {
    setIsGenerating(true);
    setError(null);
    try {
      const output = await generateViralStrategy(userData, tone);
      setResult(output);
      setStep(questions.length + 1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const restart = () => {
    setStep(0);
    setUserData({
      platform: '',
      topic: '',
      audience: '',
      emotion: '',
      style: '',
      benefit: ''
    });
    setResult(null);
    setError(null);
  };

  const renderContent = () => {
    if (step === 0) {
      return (
        <div className="flex flex-col items-center text-center gap-8 py-12 animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-indigo-600/40 relative">
             <i className="fa-solid fa-bolt text-white"></i>
             <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter">
              Viral<span className="gradient-text">Forge</span> 🔥
            </h1>
            <p className="text-slate-400 text-lg md:text-2xl max-w-xl mx-auto leading-relaxed">
              Craft scroll-stopping titles and hooks that dominate the algorithm.
            </p>
          </div>
          <button
            onClick={() => setStep(1)}
            className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95"
          >
            Forge Your Strategy
            <i className="fa-solid fa-fire-flame-curved ml-3 group-hover:rotate-12 transition-transform"></i>
          </button>
        </div>
      );
    }

    if (step <= questions.length) {
      const qIdx = step - 1;
      const currentQ = questions[qIdx];
      const overallPercentage = Math.round(((step - 1) / questions.length) * 100);

      return (
        <div className="max-w-2xl mx-auto w-full px-4">
          <div className="mb-10 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-gauge-high text-indigo-500"></i> Question Flow
              </span>
              <span className="text-indigo-400">{overallPercentage}% Completion</span>
            </div>
            <div className="flex items-center gap-1.5 h-2">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-full flex-1 rounded-full transition-all duration-700 ease-in-out ${
                    i < qIdx 
                      ? 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                      : i === qIdx 
                        ? 'bg-indigo-400/50 animate-pulse' 
                        : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <QuestionCard
            question={currentQ.q}
            options={currentQ.options}
            placeholder={currentQ.placeholder}
            value={(userData as any)[currentQ.id]}
            onChange={(val) => setUserData({ ...userData, [currentQ.id]: val })}
            onNext={handleNext}
            isLoading={isGenerating && step === questions.length}
            currentStep={step}
            totalSteps={questions.length}
          />
        </div>
      );
    }

    if (result) {
      return (
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/60 pb-8">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tight">Strategy Forge <span className="text-indigo-500">Complete</span></h2>
              <p className="text-slate-500 font-medium">Platform: {userData.platform} • Style: {userData.style}</p>
            </div>
            <button 
              onClick={restart}
              className="px-6 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-all text-slate-300 hover:text-white flex items-center justify-center gap-2 text-sm font-bold"
            >
              <i className="fa-solid fa-rotate-left"></i> New Blueprint
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="glass-card rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="fa-solid fa-rocket text-9xl"></i>
              </div>
              <div className="prose prose-invert max-w-none prose-headings:text-indigo-400 prose-ul:list-disc prose-li:text-slate-300">
                {result.split('\n').map((line, i) => {
                  if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)')) {
                    return (
                      <div key={i} className="flex items-center gap-3 mt-10 mb-6 group">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black group-hover:scale-110 transition-transform">
                          {line.charAt(0)}
                        </div>
                        <h3 className="text-2xl font-black m-0 text-white uppercase tracking-tight">{line.substring(3)}</h3>
                      </div>
                    );
                  }
                  if (line.trim().startsWith('-')) {
                    return (
                      <div key={i} className="flex gap-4 mb-4 items-start group">
                        <div className="h-6 w-1 bg-indigo-500 rounded-full mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                        <p className="m-0 text-lg text-slate-200 leading-relaxed font-medium">{line.replace('-', '').trim()}</p>
                      </div>
                    );
                  }
                  if (line.trim()) {
                    return <p key={i} className="mb-4 text-slate-400 leading-relaxed">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/5 rounded-3xl p-10 text-center space-y-8 backdrop-blur-sm">
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Fine-Tune the Forge</h3>
                <p className="text-slate-400 max-w-md mx-auto">Adjust the creative temperature. Choose a tone to regenerate new variations instantly.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {(['shocking', 'emotional', 'professional'] as RefinementTone[]).map((t) => (
                  <button
                    key={t}
                    disabled={isGenerating}
                    onClick={() => performGeneration(t)}
                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 text-white font-bold transition-all flex items-center gap-3 active:scale-95 shadow-lg"
                  >
                    {isGenerating ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={restart}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
               <i className="fa-solid fa-bolt text-lg"></i>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">ViralForge</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto flex flex-col justify-center py-12">
        {error && (
          <div className="max-w-2xl mx-auto w-full mb-10 bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            <div className="font-semibold">{error}</div>
          </div>
        )}
        
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
        <p>© 2025 ViralForge • Engine for Viral Creators</p>
      </footer>
    </div>
  );
}

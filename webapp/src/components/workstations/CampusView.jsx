import React, { useState, useEffect } from 'react';
import {
  PartyPopper,
  Play,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function CampusView({ onToast, onAddCredits }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [countdown, setCountdown] = useState({ d: 8, h: 14, m: 27, s: 43 });

  const quizQuestions = [
    {
      q: "A 2-day-old term neonate presents with bilious vomiting and progressive abdominal distension. Radiograph reveals the classic 'double bubble' sign. What is the diagnosis?",
      options: [
        { text: 'A. Infantile Hypertrophic Pyloric Stenosis', correct: false },
        { text: 'B. Congenital Duodenal Atresia (Trisomy 21)', correct: true },
        { text: 'C. Hirschsprung Disease', correct: false },
        { text: 'D. Midgut Malrotation with Volvulus', correct: false },
      ],
      rationale: "Duodenal atresia results from failure of duodenal recanalization. The 'double bubble' sign is diagnostic. Over 30% are linked to Down syndrome. — Nelson Pediatrics 21st Ed."
    },
    {
      q: "A 58-year-old male with acute inferior wall STEMI presents with BP 82/50 mmHg, clear lung fields, and marked jugular venous distension. ECG shows ST elevation in V4R. What is the immediate intervention?",
      options: [
        { text: 'A. Intravenous Furosemide bolus', correct: false },
        { text: 'B. Sublingual Nitroglycerin 0.4 mg', correct: false },
        { text: 'C. Intravenous Normal Saline fluid bolus', correct: true },
        { text: 'D. Immediate IV Beta-blocker', correct: false },
      ],
      rationale: "Right Ventricular Infarction is preload dependent. Nitrates and diuretics severely drop RV preload and are contraindicated. Volume loading is mandatory. — Harrison's 21st Ed."
    }
  ];

  // Live Countdown decrement
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (idx, opt) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (opt.correct) {
      setScore(s => s + 50);
      onAddCredits(50);
      onToast({ type: 'success', title: 'Correct!', message: '+50 Pulse Credits earned. High-yield clinical pearl.' });
    } else {
      onToast({ type: 'error', title: 'Incorrect', message: 'Review clinical rationale from Nelson/Harrison below.' });
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizStarted(false);
      onToast({ type: 'success', title: 'Grand Prix Finished!', message: `National Quiz completed! Score: ${score + 50} PC. Placed in Top 3% AIR #42.` });
    }
  };

  return (
    <div className="space-y-5">
      {/* Live Arena Countdown Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy size={14} />
            <span>National Clinical Grand Prix Circuit</span>
          </div>
          <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
            IAP Pediatrics & Neonatology Clinical Sprint 2026
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
            Timed Spotters · High-Yield Vignettes · Reward: 250 PC + National Laureate Badge
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-zinc-400">Next National Round:</p>
            <div className="font-display font-extrabold text-2xl text-amber-500 font-mono">
              {String(countdown.d).padStart(2, '0')}:{String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={() => {
              setQuizStarted(true);
              setCurrentQIndex(0);
              setScore(0);
              setSelectedOption(null);
              setShowExplanation(false);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Play size={14} fill="currentColor" />
            <span>Enter Live Arena</span>
          </button>
        </div>
      </div>

      {/* Interactive Quiz Box */}
      {quizStarted && (
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.08] rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.05] pb-3 text-xs">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400">
              Question {currentQIndex + 1} of {quizQuestions.length}
            </span>
            <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
              Score: {score} PC
            </span>
          </div>

          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
            {quizQuestions[currentQIndex].q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quizQuestions[currentQIndex].options.map((opt, i) => {
              let style = 'bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200';
              if (selectedOption !== null) {
                if (opt.correct) style = 'bg-emerald/10 border-emerald text-emerald font-semibold';
                else if (selectedOption === i) style = 'bg-rose-500/10 border-rose-500 text-rose-400 font-semibold';
              }

              return (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(i, opt)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${style}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-3.5 bg-emerald/5 border border-emerald/20 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <span className="font-bold text-emerald">✅ Clinical Rationale:</span>
              <p className="leading-relaxed">{quizQuestions[currentQIndex].rationale}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-3.5 py-1.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-lg transition-colors"
                >
                  {currentQIndex + 1 < quizQuestions.length ? 'Next Question →' : 'Complete Sprint'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medical College Fests Cards */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <PartyPopper size={16} className="text-amber-500" />
          <span>Premier Medical College Fests (Verified National Circuit)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onToast({ type: 'success', title: 'AIIMS Pulse 2026', message: 'Suture & Trauma workshop booked. QR Delegate pass generated.' })}
            className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="h-20 bg-gradient-to-r from-purple-900 via-indigo-900 to-navy-950 flex items-center justify-center text-white font-display font-black text-xl tracking-wider">
              AIIMS PULSE 2026
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">South Asia's Largest Medical Festival</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">AIIMS New Delhi · Sep 15–22 · 500+ Medical Colleges</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-emerald font-semibold">Registered ✓</span>
                <span className="font-mono text-zinc-400">₹1,200 Fee</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onToast({ type: 'info', title: 'AFMC Silhouettes', message: 'Military Medicine simulation registration confirmed.' })}
            className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="h-20 bg-gradient-to-r from-blue-900 via-cyan-900 to-navy-950 flex items-center justify-center text-white font-display font-black text-xl tracking-wider">
              AFMC SILHOUETTES
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Armed Forces Medical College, Pune</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">Feb 2027 · Combat Casualty Care & Forensic Mock Trials</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-blue-500 font-semibold">Open for Abstracts</span>
                <span className="font-mono text-zinc-400">₹800 Fee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

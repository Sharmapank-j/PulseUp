import React, { useState, useEffect } from 'react';
import {
  PartyPopper,
  Play,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Clock,
  Award,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CampusView({ onToast, onAddCredits }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [countdown, setCountdown] = useState({ d: 8, h: 14, m: 27, s: 43 });
  const [showHistory, setShowHistory] = useState(false);
  const [quizHistory, setQuizHistory] = useState([
    { date: '2026-09-09', specialty: 'Pediatrics, Cardiology', score: 150, total: 5, percentile: '94.2%' },
    { date: '2026-09-07', specialty: 'Pharmacology, Obstetrics', score: 100, total: 5, percentile: '88.7%' },
    { date: '2026-09-04', specialty: 'Trauma Surgery, Medicine', score: 200, total: 5, percentile: '98.1%' },
  ]);

  const quizQuestions = [
    {
      specialty: 'Pediatrics',
      q: "A 2-day-old term neonate presents with bilious vomiting and progressive abdominal distension. Abdominal radiograph demonstrates the classic 'double bubble' sign with absent distal bowel gas. What is the definitive diagnosis?",
      options: [
        { text: 'A. Infantile Hypertrophic Pyloric Stenosis', correct: false },
        { text: 'B. Congenital Duodenal Atresia (Trisomy 21 Association)', correct: true },
        { text: 'C. Hirschsprung Disease', correct: false },
        { text: 'D. Midgut Malrotation with Volvulus', correct: false },
      ],
      rationale: "Duodenal atresia results from failure of duodenal recanalization in early gestation. Bilious vomiting with the classic 'double bubble' sign (dilated stomach and proximal duodenum) is pathognomonic. Over 30% of infants have Trisomy 21. — Nelson Textbook of Pediatrics, 21st Ed."
    },
    {
      specialty: 'Cardiology',
      q: "A 58-year-old male with acute inferior wall STEMI presents with BP 82/50 mmHg, clear lung fields, and marked jugular venous distension. ECG reveals 2mm ST elevation in right-sided lead V4R. What is the immediate life-saving intervention?",
      options: [
        { text: 'A. Intravenous Furosemide 40 mg bolus', correct: false },
        { text: 'B. Sublingual Nitroglycerin 0.4 mg tablet', correct: false },
        { text: 'C. Rapid Intravenous Normal Saline fluid loading (1,000 mL)', correct: true },
        { text: 'D. Immediate Intravenous Metoprolol infusion', correct: false },
      ],
      rationale: "Right Ventricular Infarction is critically preload-dependent. Administration of nitrates or diuretics dramatically drops RV filling pressure and can cause catastrophic hemodynamic collapse. Aggressive crystalloid volume loading is mandatory. — Harrison's Principles of Internal Medicine, 21st Ed."
    },
    {
      specialty: 'Trauma Surgery',
      q: "A 28-year-old polytrauma victim exhibits tracheal deviation to the right, hyperresonance and absent breath sounds on the left hemithorax, and profound cyanosis (BP 70/40 mmHg). According to ATLS 10th Edition guidelines, where should immediate needle decompression be performed?",
      options: [
        { text: 'A. 2nd Intercostal Space, Mid-Clavicular Line (or 4th/5th ICS anterior axillary line)', correct: true },
        { text: 'B. 6th Intercostal Space, Posterior Axillary Line', correct: false },
        { text: 'C. Subxiphoid space angled 45 degrees toward the left shoulder', correct: false },
        { text: 'D. 1st Intercostal Space adjacent to the sternal angle', correct: false },
      ],
      rationale: "Tension pneumothorax requires immediate needle decompression before chest tube thoracostomy. ATLS 10th Edition recommends 2nd ICS in the mid-clavicular line in pediatric patients and accepts the 4th/5th ICS anterior to the mid-axillary line in muscular or obese adults with large chest wall depth. — ATLS Student Manual, 10th Ed."
    },
    {
      specialty: 'Pharmacology',
      q: "A farmer is brought to casualty following accidental inhalation of an organophosphate insecticide. He has pinpoint pupils, hypersalivation, severe wheezing with bilateral coarse crepitations, and HR 48 bpm. What clinical endpoint indicates adequate initial atropinization?",
      options: [
        { text: 'A. Dilatation of pupils (mydriasis) to 6 mm', correct: false },
        { text: 'B. Increase in heart rate above 120 bpm', correct: false },
        { text: 'C. Complete clearing of tracheobronchial secretions and pulmonary crackles', correct: true },
        { text: 'D. Cessation of muscle fasciculations', correct: false },
      ],
      rationale: "The primary cause of death in organophosphate poisoning is respiratory failure from copious bronchorrhea and bronchospasm. The primary therapeutic endpoint for atropine is clearing of chest crepitations and drying of bronchial secretions—NOT pupil dilation or heart rate alone. Muscle fasciculations are nicotinic and do not respond to atropine (they require oximes like Pralidoxime). — Goodman & Gilman's Pharmacological Basis of Therapeutics, 14th Ed."
    },
    {
      specialty: 'Obstetrics',
      q: "A 26-year-old P2L1 develops profuse vaginal bleeding following vaginal delivery. On palpation, the uterus is soft, boggy, and relaxed above the umbilicus. After securing two wide-bore IV cannulae, what is the mandatory immediate management combination?",
      options: [
        { text: 'A. Bimanual uterine compression massage + Intravenous Oxytocin infusion', correct: true },
        { text: 'B. Immediate surgical exploration and uterine artery ligation', correct: false },
        { text: 'C. Wait 30 minutes for placental bed natural clotting', correct: false },
        { text: 'D. Intramuscular Ergometrine in a patient with severe pre-eclampsia (BP 170/110 mmHg)', correct: false },
      ],
      rationale: "Uterine atony accounts for over 70% of primary postpartum hemorrhage (PPH). The first-line emergency intervention is physical bimanual uterine compression alongside rapid uterotonic administration with IV Oxytocin (10–20 IU in normal saline). Ergometrine is strictly contraindicated in pre-eclampsia due to risk of intracranial hemorrhage. — Williams Obstetrics, 26th Ed."
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

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowScorecard(false);
  };

  const handleSelectOption = (idx, opt) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (opt.correct) {
      setScore(s => s + 50);
      onAddCredits(50);
      onToast({ type: 'success', title: 'Spotter Mastered!', message: '+50 Pulse Credits deposited. Textbook rationale unlocked.' });
    } else {
      onToast({ type: 'error', title: 'Clinical Flaw Flagged', message: 'Review textbook rationale below before advancing.' });
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizStarted(false);
      setShowScorecard(true);
      const today = new Date().toISOString().split('T')[0];
      setQuizHistory(prev => [{ date: today, specialty: 'Multi-Specialty Sprint', score, total: quizQuestions.length, percentile: '96.8%' }, ...prev.slice(0, 4)]);
      onToast({
        type: 'success',
        title: 'National Grand Prix Completed!',
        message: `Total Score: ${score} PC. Placed in 96.8th National Percentile. Certificate ready.`
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Live Arena Countdown Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy size={14} />
            <span>National Clinical Grand Prix Circuit (5-Question Sprint)</span>
          </div>
          <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
            All-India Multi-Specialty Clinical Spotter Sprint 2026
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
            Pediatrics, Cardiology, Trauma Surgery, Pharmacology & Obstetrics · High-Yield Vignettes · Reward: +250 PC + National Laureate Rank
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-zinc-400">Next Live Round in:</p>
            <div className="font-display font-extrabold text-2xl text-amber-500 font-mono">
              {String(countdown.d).padStart(2, '0')}:{String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Play size={14} fill="currentColor" />
            <span>{quizStarted ? 'Restart Sprint' : 'Enter 5-Q Arena'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Quiz Box */}
      {quizStarted && (
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn">
          {/* Header & Question Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-white/[0.05] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald uppercase text-[11px] bg-emerald/10 px-2 py-0.5 rounded">
                {quizQuestions[currentQIndex].specialty}
              </span>
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                Question {currentQIndex + 1} of {quizQuestions.length}
              </span>
            </div>

            {/* Q1-Q5 Progress Pills */}
            <div className="flex items-center gap-1.5">
              {quizQuestions.map((q, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center transition-all ${
                    idx === currentQIndex
                      ? 'bg-amber-500 text-navy-950 ring-2 ring-amber-500/40'
                      : idx < currentQIndex
                      ? 'bg-emerald/20 text-emerald'
                      : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-400'
                  }`}
                >
                  Q{idx + 1}
                </span>
              ))}
              <span className="ml-2 font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                Score: {score} PC
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
            {quizQuestions[currentQIndex].q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizQuestions[currentQIndex].options.map((opt, i) => {
              let style = 'bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200 hover:border-emerald/40';
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
            <div className="p-4 bg-emerald/5 border border-emerald/20 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 space-y-2 animate-fadeIn">
              <span className="font-bold text-emerald flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>Textbook Diagnostic Rationale:</span>
              </span>
              <p className="leading-relaxed">{quizQuestions[currentQIndex].rationale}</p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {currentQIndex + 1 < quizQuestions.length ? 'Next Question →' : 'Finish & View Scorecard →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* National Laureate Scorecard Modal */}
      {showScorecard && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-500 flex items-center justify-center mx-auto">
              <Trophy size={28} />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Grand Prix Laureate Certificate
              </span>
              <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-100 mt-2">
                All-India Med-Q Laureate
              </h3>
              <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
                National Medical Residency Diagnostic Sprint
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl text-xs">
              <div>
                <p className="text-[10px] text-zinc-400">Total Credits Earned</p>
                <p className="font-mono font-bold text-base text-amber-500">+{score} PC</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400">National Percentile</p>
                <p className="font-mono font-bold text-base text-emerald">96.8% (AIR #42)</p>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowScorecard(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowScorecard(false);
                }}
                className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
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

          <div
            onClick={() => onToast({ type: 'info', title: 'CMC Pegasus 2026', message: 'Abstract submission for CMC Vellore Pegasus 2026 registered.' })}
            className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="h-20 bg-gradient-to-r from-emerald-900 via-teal-900 to-navy-950 flex items-center justify-center text-white font-display font-black text-xl tracking-wider">
              CMC PEGASUS
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Christian Medical College, Vellore</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">Nov 2026 · Ultrasound Skills Lab, Surgery & Microbiology Olympiad</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-amber-500 font-semibold">Abstracts Open</span>
                <span className="font-mono text-zinc-400">₹950 Fee</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onToast({ type: 'info', title: 'JIPMER Spandan 2026', message: 'JIPMER Spandan cultural and clinical fest registration opened.' })}
            className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="h-20 bg-gradient-to-r from-rose-900 via-orange-900 to-navy-950 flex items-center justify-center text-white font-display font-black text-xl tracking-wider">
              JIPMER SPANDAN
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">JIPMER Puducherry (National Importance)</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">Dec 2026 · Clinical Quiz Circuit, Anatomy Dissection Challenge</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-blue-500 font-semibold">Early Bird Open</span>
                <span className="font-mono text-zinc-400">₹700 Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz History Log */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              My Quiz History ({quizHistory.length} sessions)
            </h4>
            {showHistory ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
          </button>
          {showHistory && (
            <div className="border-t border-zinc-100 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.05]">
              {quizHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{h.specialty}</p>
                    <p className="text-[10px] text-zinc-400">{h.date} · {h.total} questions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-amber-500">+{h.score} PC</p>
                    <p className="text-[10px] text-emerald font-semibold">{h.percentile} Percentile</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

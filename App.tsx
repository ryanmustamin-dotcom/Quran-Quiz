import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from './services/geminiService';
import { audioService } from './services/audioService';
import { QuizQuestion, GameMode } from './types';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BookOpen, Search, Mic, Book, Grid, Volume2, VolumeX } from 'lucide-react';

type GameState = 'MENU' | 'LOADING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';

// Custom Vector Logo Component (Letter Qaf with Glow)
const Logo = () => (
    <div className="flex flex-col items-center mb-10 relative z-10">
        <div className="relative w-36 h-36 flex items-center justify-center group">
             {/* Glow Animation Background */}
             <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-30 blur-xl animate-pulse group-hover:opacity-50 transition-all duration-700"></div>
             
             {/* Vector/SVG Container */}
             <div className="relative w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
                    <defs>
                        <linearGradient id="qafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: '#047857', stopOpacity: 1}} />
                            <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                        </linearGradient>
                        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Background Shape */}
                    <rect x="15" y="15" width="70" height="70" rx="20" transform="rotate(45 50 50)" fill="url(#qafGradient)" stroke="white" strokeWidth="2.5" className="shadow-lg" />
                    
                    {/* Qaf Letter using Text as Vector Path equivalent */}
                    <text 
                        x="50" 
                        y="68" 
                        fontFamily="Amiri" 
                        fontWeight="bold"
                        fontSize="65" 
                        fill="white" 
                        textAnchor="middle" 
                        filter="url(#glowFilter)"
                        className="animate-pulse"
                        style={{ animationDuration: '3s' }}
                    >
                        ق
                    </text>
                </svg>
             </div>
             
             {/* Orbiting Decorative Dot */}
             <div className="absolute top-0 right-4 w-5 h-5 bg-amber-400 rounded-full border-2 border-white shadow-lg animate-bounce delay-100"></div>
        </div>
        <h1 className="mt-4 text-5xl md:text-6xl font-extrabold text-emerald-900 tracking-tight drop-shadow-sm font-sans">Quran Quiz</h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full mt-3"></div>
    </div>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  // Countdown State
  const [countdown, setCountdown] = useState<number>(3);

  const toggleMute = () => {
      const newState = audioService.toggleMute();
      setIsMuted(newState);
  };

  // Handle Countdown Timer
  useEffect(() => {
    let timer: any;
    if (gameState === 'COUNTDOWN') {
        audioService.playTick(); // Play initial tick
        timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    audioService.playCorrect(); // Go sound
                    setTimeout(() => setGameState('PLAYING'), 500); // Small delay before switch
                    return 0; // "Mulai!"
                }
                audioService.playTick();
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Handle Game Finish Sound
  useEffect(() => {
      if (gameState === 'FINISHED') {
          setTimeout(() => {
              audioService.playWin();
          }, 500);
      }
  }, [gameState]);

  const startGame = async (mode: GameMode) => {
    audioService.playClick();
    setGameState('LOADING');
    const data = await generateQuizQuestions(mode);
    setQuestions(data);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    
    // Start countdown sequence
    setCountdown(3);
    setGameState('COUNTDOWN');
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
        setScore(prev => prev + questions[currentIndex].points);
        setCorrectCount(prev => prev + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameState('FINISHED');
    }
  };

  const handleSurrender = () => {
      audioService.playClick();
      // End game immediately, user keeps current score/progress
      setGameState('FINISHED');
  };

  const resetGame = () => {
      audioService.playClick();
      setGameState('MENU');
      setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col font-sans relative overflow-hidden">
      
      {/* Interactive Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="font-arabic text-emerald-100 text-9xl absolute top-20 left-[10%] opacity-20 animate-float delay-1000">ا</div>
          <div className="font-arabic text-emerald-100 text-8xl absolute bottom-40 right-[15%] opacity-20 animate-float delay-2000">س</div>
          <div className="font-arabic text-amber-100 text-9xl absolute top-40 right-[20%] opacity-20 animate-float delay-3000">م</div>
          <div className="font-arabic text-emerald-100 text-9xl absolute bottom-20 left-[20%] opacity-20 animate-float delay-4000">ي</div>
          <div className="font-arabic text-emerald-50 text-[12rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 animate-float">۞</div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer relative z-50 group" onClick={resetGame}>
            <div className="bg-emerald-600 p-2 rounded-lg text-white group-hover:bg-emerald-700 transition-colors">
                <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-emerald-900 hidden md:block">Quran Quiz</h1>
        </div>
        
        <div className="flex items-center gap-4 relative z-50">
             {gameState === 'PLAYING' && (
                 <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Soal</span>
                     <span className="text-lg font-bold text-emerald-600">{currentIndex + 1}</span>
                     <span className="text-slate-400 font-medium">/{questions.length}</span>
                 </div>
             )}
             
             <button 
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
             >
                 {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center relative z-10">
        
        {gameState === 'MENU' && (
          <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-700 flex flex-col items-center">
            
            <Logo />

            <div className="text-center mb-10 max-w-lg">
                <p className="text-slate-600 text-lg">
                Uji wawasan Al-Quran dengan tantangan interaktif. Pilih kategori untuk memulai.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div onClick={() => startGame('TEBAK_SURAT')} className="group bg-white p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 text-emerald-50 font-arabic text-9xl opacity-50 group-hover:scale-125 transition-transform duration-700">س</div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <Search size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Tebak Surat & Ayat</h3>
                    </div>
                    <p className="text-slate-500 text-sm relative z-10">Identifikasi nama surat dari potongan ayat atau sebaliknya.</p>
                </div>

                <div onClick={() => startGame('LENGKAPI_AYAT')} className="group bg-white p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 text-amber-50 font-arabic text-9xl opacity-50 group-hover:scale-125 transition-transform duration-700">ك</div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="bg-amber-100 text-amber-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <Grid size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Lengkapi Ayat</h3>
                    </div>
                    <p className="text-slate-500 text-sm relative z-10">Isi bagian yang hilang dari ayat-ayat pilihan.</p>
                </div>

                <div onClick={() => startGame('ILMU_TAJWID')} className="group bg-white p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 text-blue-50 font-arabic text-9xl opacity-50 group-hover:scale-125 transition-transform duration-700">ج</div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <Mic size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Tajwid & Ilmu Quran</h3>
                    </div>
                    <p className="text-slate-500 text-sm relative z-10">Tes wawasan tentang hukum tajwid dan makharijul huruf.</p>
                </div>

                <div onClick={() => startGame('ARTI_KATA')} className="group bg-white p-6 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 text-purple-50 font-arabic text-9xl opacity-50 group-hover:scale-125 transition-transform duration-700">ع</div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="bg-purple-100 text-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <Book size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Arti Kata</h3>
                    </div>
                    <p className="text-slate-500 text-sm relative z-10">Terjemahkan kosakata Bahasa Arab ke Bahasa Indonesia.</p>
                </div>
            </div>
          </div>
        )}

        {gameState === 'LOADING' && (
          <LoadingSpinner />
        )}

        {/* Countdown Overlay */}
        {gameState === 'COUNTDOWN' && (
          <div className="flex items-center justify-center animate-in zoom-in duration-300 relative z-50">
             <div className="relative">
                 <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                 <h1 className="text-8xl md:text-9xl font-black text-emerald-600 relative z-10 drop-shadow-2xl scale-110 transition-transform">
                    {countdown > 0 ? countdown : "Mulai!"}
                 </h1>
             </div>
          </div>
        )}

        {gameState === 'PLAYING' && questions.length > 0 && (
          <div className="w-full animate-in fade-in duration-500">
             <QuestionCard 
                key={questions[currentIndex].id}
                question={questions[currentIndex]} 
                onAnswer={handleAnswer} 
                onSurrender={handleSurrender}
                totalQuestions={questions.length}
                currentIndex={currentIndex}
             />
          </div>
        )}

        {gameState === 'FINISHED' && (
          <ResultScreen 
            score={score} 
            totalPoints={questions.reduce((acc, q) => acc + q.points, 0)}
            correctCount={correctCount}
            totalQuestions={questions.length}
            onRestart={resetGame}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-xs md:text-sm relative z-10 border-t border-slate-100 mt-auto bg-white/50 backdrop-blur-sm">
        <p className="font-medium">Created by Ryan Mustami Nugroho | Guru SMK-IT As-Syifa Boarding School. 2025</p>
      </footer>
    </div>
  );
};

export default App;
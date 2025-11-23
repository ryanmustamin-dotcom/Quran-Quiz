import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Star, RefreshCw, Share2 } from 'lucide-react';
import { getRandomAdvice } from '../services/geminiService';

interface Props {
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  onRestart: () => void;
}

export const ResultScreen: React.FC<Props> = ({ score, totalPoints, correctCount, totalQuestions, onRestart }) => {
  const [advice, setAdvice] = useState<string>("");

  useEffect(() => {
    setAdvice(getRandomAdvice());
  }, []);

  // Avoid division by zero
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  
  // Determine star rating
  const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 relative z-20">
      <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <svg width="100%" height="100%">
                 <pattern id="islamic-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" className="text-white"/>
                 </pattern>
                 <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
             </svg>
        </div>

        <h2 className="text-emerald-100 font-bold uppercase tracking-wider text-sm mb-2 relative z-10">Nilai Akhir</h2>
        <div className="text-6xl font-extrabold text-white mb-4 relative z-10">
          {percentage}%
        </div>
        
        <div className="flex justify-center gap-2 mb-4 relative z-10">
          {[...Array(3)].map((_, i) => (
            <Star 
                key={i} 
                className={`w-10 h-10 ${i < stars ? 'fill-amber-400 text-amber-400 drop-shadow-lg' : 'fill-emerald-800 text-emerald-800'}`} 
            />
          ))}
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-center text-center">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
                <p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Jawaban Benar</p>
                <p className="text-3xl font-extrabold text-emerald-600">{correctCount} <span className="text-slate-400 text-lg font-normal">/ {totalQuestions}</span></p>
             </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h3 className="text-amber-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Nasihat Untukmu
            </h3>
            <p className="text-amber-900 italic leading-relaxed text-sm md:text-base">
                "{advice}"
            </p>
        </div>

        <div className="space-y-3">
            <Button onClick={onRestart} fullWidth variant="primary" className="flex items-center gap-2">
                <RefreshCw size={20} /> Ke Menu Utama
            </Button>
            <Button 
                onClick={() => alert("Fitur bagikan akan segera hadir!")} 
                fullWidth 
                variant="outline"
                className="flex items-center gap-2"
            >
                <Share2 size={20} /> Bagikan
            </Button>
        </div>
      </div>
    </div>
  );
};
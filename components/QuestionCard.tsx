import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuestionType, CompleteVerseQuestion, MultipleChoiceQuestion } from '../types';
import { Button } from './Button';
import { audioService } from '../services/audioService';
import { CheckCircle, XCircle, Flag } from 'lucide-react';

interface Props {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onSurrender: () => void;
  totalQuestions: number;
  currentIndex: number;
}

const QUESTION_TIMER_SECONDS = 20;

export const QuestionCard: React.FC<Props> = ({ question, onAnswer, onSurrender, totalQuestions, currentIndex }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_SECONDS);

  // Timer Effect
  useEffect(() => {
    // Reset state when question changes
    setSelectedOption(null);
    setHasSubmitted(false);
    setTimeLeft(QUESTION_TIMER_SECONDS);
  }, [question.id]);

  useEffect(() => {
    if (hasSubmitted || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, hasSubmitted]);

  const handleTimeOut = () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    audioService.playWrong();
    // Time out counts as wrong answer
    setTimeout(() => {
        onAnswer(false);
    }, 2000);
  };

  const handleSelect = (option: string) => {
    if (hasSubmitted) return;
    audioService.playClick();
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    
    let isCorrect = false;
    
    if (question.type === QuestionType.COMPLETE_VERSE) {
      isCorrect = selectedOption === question.hiddenPart;
    } else {
      isCorrect = selectedOption === (question as MultipleChoiceQuestion).correctAnswer;
    }

    if (isCorrect) {
        audioService.playCorrect();
    } else {
        audioService.playWrong();
    }

    setTimeout(() => {
        onAnswer(isCorrect);
    }, 1500);
  };

  // Timer Progress Color
  const getTimerColor = () => {
    if (timeLeft > 10) return 'bg-emerald-500';
    if (timeLeft > 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderContent = () => {
    switch (question.type) {
      case QuestionType.GUESS_SURAH:
      case QuestionType.TRANSLATE_WORD:
      case QuestionType.GENERAL_KNOWLEDGE:
        const mcq = question as MultipleChoiceQuestion;
        return (
          <div className="space-y-6">
            {mcq.arabicText && (
              <div className="bg-emerald-50 p-6 md:p-8 rounded-2xl border border-emerald-100 text-center shadow-inner">
                {/* Increased line-height (leading) to prevent overlap */}
                <p className="font-arabic text-3xl md:text-5xl leading-[2.5] md:leading-[3] text-emerald-900 mb-2 drop-shadow-sm" dir="rtl">
                  {mcq.arabicText}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mcq.options.map((opt, idx) => {
                let btnVariant: 'outline' | 'primary' | 'danger' = 'outline';
                if (hasSubmitted) {
                   if (opt === mcq.correctAnswer) btnVariant = 'primary';
                   else if (opt === selectedOption) btnVariant = 'danger';
                } else if (selectedOption === opt) {
                    btnVariant = 'primary';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    disabled={hasSubmitted}
                    className={`
                        p-4 rounded-xl border-2 text-lg font-semibold transition-all relative overflow-hidden
                        ${btnVariant === 'outline' ? 'border-emerald-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-slate-700' : ''}
                        ${btnVariant === 'primary' ? 'border-emerald-600 bg-emerald-600 text-white' : ''}
                        ${btnVariant === 'danger' ? 'border-red-500 bg-red-500 text-white' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between relative z-10">
                        <span>{opt}</span>
                        {hasSubmitted && opt === mcq.correctAnswer && <CheckCircle size={20} />}
                        {hasSubmitted && opt === selectedOption && opt !== mcq.correctAnswer && <XCircle size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case QuestionType.COMPLETE_VERSE:
        const cvq = question as CompleteVerseQuestion;
        return (
          <div className="space-y-8">
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100 text-center shadow-inner flex flex-wrap justify-center items-center gap-4 leading-[3]" dir="rtl">
              {cvq.versePart1 && <span className="font-arabic text-2xl md:text-4xl text-emerald-900 leading-[3]">{cvq.versePart1}</span>}
              
              <div className={`min-w-[100px] h-14 border-b-4 border-dashed mx-2 flex items-center justify-center px-4 rounded transition-colors ${
                  hasSubmitted 
                    ? (selectedOption === cvq.hiddenPart ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500') 
                    : 'border-emerald-300 bg-white/50'
              }`}>
                 {selectedOption ? (
                     <span className="font-arabic text-xl md:text-3xl text-emerald-800">{selectedOption}</span>
                 ) : (
                     <span className="text-emerald-300 text-sm">?</span>
                 )}
              </div>

              {cvq.versePart2 && <span className="font-arabic text-2xl md:text-4xl text-emerald-900 leading-[3]">{cvq.versePart2}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4" dir="rtl">
                {cvq.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(opt)}
                        disabled={hasSubmitted}
                        className={`
                            p-4 rounded-xl border-2 text-xl md:text-2xl font-arabic transition-all py-6
                            ${selectedOption === opt && !hasSubmitted ? 'border-amber-500 bg-amber-50 text-amber-900' : 
                              hasSubmitted && opt === cvq.hiddenPart ? 'border-emerald-500 bg-emerald-500 text-white' :
                              hasSubmitted && opt === selectedOption && opt !== cvq.hiddenPart ? 'border-red-500 bg-red-500 text-white' :
                              'border-slate-200 bg-white hover:border-emerald-300 text-slate-800'
                            }
                        `}
                    >
                        {opt}
                    </button>
                ))}
            </div>
          </div>
        );
      
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      
      {/* Top Header Row with Surrender Button */}
      <div className="flex items-center justify-between mb-2">
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level {question.difficultyLevel || currentIndex + 1}</span>
         <button 
            onClick={onSurrender}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
         >
            <Flag size={14} /> Menyerah
         </button>
      </div>

      {/* Level and Timer Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight flex-1 mr-4">{question.questionText}</h2>
        
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={151}
                  strokeDashoffset={151 - (timeLeft / QUESTION_TIMER_SECONDS) * 151}
                  strokeLinecap="round"
                  className={`${timeLeft > 10 ? 'text-emerald-500' : timeLeft > 5 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-linear`}
                />
             </svg>
             <span className="absolute text-lg font-bold text-slate-700">{timeLeft}</span>
        </div>
      </div>

      {/* Timer Bar (Visual urgency) */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div 
            className={`h-full ${getTimerColor()} transition-all duration-1000 ease-linear`}
            style={{ width: `${(timeLeft / QUESTION_TIMER_SECONDS) * 100}%` }}
        />
      </div>
      
      {renderContent()}

      <div className="mt-8">
        {!hasSubmitted ? (
            <Button 
                onClick={handleSubmit} 
                fullWidth 
                disabled={!selectedOption}
                variant="primary"
            >
                Jawab
            </Button>
        ) : (
            <div className={`text-center font-bold text-lg p-3 rounded-xl ${timeLeft === 0 && !selectedOption ? 'bg-red-100 text-red-700' : (selectedOption === ((question as any).correctAnswer || (question as any).hiddenPart) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}`}>
                {timeLeft === 0 && !selectedOption ? 'Waktu Habis!' : (selectedOption === ((question as any).correctAnswer || (question as any).hiddenPart) ? 'Jawaban Benar!' : 'Jawaban Salah')}
            </div>
        )}
      </div>
    </div>
  );
};
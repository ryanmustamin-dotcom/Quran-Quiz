export enum QuestionType {
  GUESS_SURAH = 'GUESS_SURAH',
  COMPLETE_VERSE = 'COMPLETE_VERSE',
  TRANSLATE_WORD = 'TRANSLATE_WORD',
  MATCHING = 'MATCHING',
  GENERAL_KNOWLEDGE = 'GENERAL_KNOWLEDGE' // For Tajwid/Makharijul Huruf
}

export type GameMode = 'TEBAK_SURAT' | 'LENGKAPI_AYAT' | 'ILMU_TAJWID' | 'ARTI_KATA';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  points: number;
  difficultyLevel?: number; // 1-10
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.GUESS_SURAH | QuestionType.TRANSLATE_WORD | QuestionType.GENERAL_KNOWLEDGE;
  arabicText?: string;
  options: string[];
  correctAnswer: string;
}

export interface CompleteVerseQuestion extends BaseQuestion {
  type: QuestionType.COMPLETE_VERSE;
  versePart1: string;
  versePart2: string; 
  hiddenPart: string;
  options: string[]; 
}

export type QuizQuestion = MultipleChoiceQuestion | CompleteVerseQuestion;

export interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  advice: string;
}
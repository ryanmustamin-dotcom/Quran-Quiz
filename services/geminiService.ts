import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuestionType, QuizQuestion, GameMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: [
            'GUESS_SURAH', 
            'COMPLETE_VERSE', 
            'TRANSLATE_WORD', 
            'GENERAL_KNOWLEDGE'
          ]},
          questionText: { type: Type.STRING },
          points: { type: Type.NUMBER },
          difficultyLevel: { type: Type.NUMBER, description: "Level 1 to 10" },
          arabicText: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          versePart1: { type: Type.STRING },
          hiddenPart: { type: Type.STRING },
          versePart2: { type: Type.STRING },
        },
        required: ["id", "type", "questionText", "points", "options", "correctAnswer", "difficultyLevel"],
      },
    },
  },
};

export const generateQuizQuestions = async (mode: GameMode): Promise<QuizQuestion[]> => {
  let promptContext = "";
  
  switch(mode) {
    case 'TEBAK_SURAT':
        promptContext = "Focus strictly on 'GUESS_SURAH' type. Show a verse (arabicText) and ask which Surah it belongs to.";
        break;
    case 'LENGKAPI_AYAT':
        promptContext = "Focus strictly on 'COMPLETE_VERSE' type. Provide verses with missing parts.";
        break;
    case 'ILMU_TAJWID':
        promptContext = "Focus strictly on 'GENERAL_KNOWLEDGE' type. Ask about Tajweed rules (Izhar, Idgham, etc) and Makharijul Huruf based on provided snippets or theoretical questions.";
        break;
    case 'ARTI_KATA':
        promptContext = "Focus strictly on 'TRANSLATE_WORD' type. Show an Arabic word/phrase and ask for Indonesian translation.";
        break;
  }

  // High entropy seed using timestamp and random number to force fresh generation
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 999999);
  const uniqueSessionId = `${timestamp}-${randomSeed}`;

  const prompt = `
    Create a fresh, unique, and randomized Quran Quiz set of 10 questions.
    Mode: ${mode}. 
    Context: ${promptContext}
    
    SESSION_ID: ${uniqueSessionId} (Use this to ensure completely new questions).
    
    STRICT RANDOMIZATION RULES:
    1. **NO REPETITION**: Do NOT use the same common questions (e.g. Al-Ikhlas, Al-Fatihah, An-Nas) unless they are for Level 1. You MUST select verses from RANDOM Juz (Juz 1 to 30) distributed evenly.
    2. **FRESH CONTENT**: Ensure the questions are different from a standard "default" set. Pick random Surahs like Al-Mulk, Yasin, Ar-Rahman, Al-Waqiah, Al-Kahf, and random verses from Al-Baqarah, Ali Imran, etc.
    3. **DIFFICULTY CURVE**: 
       - Q1-Q3: Easy (Common Juz 30)
       - Q4-Q7: Medium (Famous verses from other Juz)
       - Q8-Q10: Hard (Random verses from middle of the Quran)
    4. **CONTENT SEPARATION**: If the question involves Arabic text, put the Arabic ONLY in 'arabicText'. The 'questionText' must be the instruction in Indonesian.
    5. **OPTIONS**: Provide 4 options. They must be distinct. Randomize the correct answer position.
    
    Output strictly JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 1.0, // Maximum randomness
      },
    });

    const data = JSON.parse(response.text || '{"questions": []}');
    
    const questions: QuizQuestion[] = data.questions.map((q: any) => {
      // Map schema fields to internal types safely
      if (q.type === 'COMPLETE_VERSE') {
        return {
            ...q,
            type: QuestionType.COMPLETE_VERSE,
            versePart1: q.versePart1 || '',
            versePart2: q.versePart2 || '',
            hiddenPart: q.hiddenPart || q.correctAnswer,
        } as unknown as QuizQuestion;
      }
      return {
        ...q,
        type: q.type as QuestionType
      } as QuizQuestion;
    });

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback data just in case API fails
    return [
       {
        id: "err-fallback",
        type: QuestionType.GUESS_SURAH,
        questionText: "Mode Offline: Potongan ayat berikut terdapat dalam surat apa?",
        points: 10,
        difficultyLevel: 1,
        arabicText: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
        options: ["Al-Ikhlas", "Al-Kautsar", "Al-Ma'un", "An-Nasr"],
        correctAnswer: "Al-Kautsar"
      }
    ];
  }
};

const ADVICE_LIST = [
    "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya. (HR. Bukhari)",
    "Bacalah Al-Qur'an, sesungguhnya ia akan datang pada hari kiamat memberikan syafaat bagi pembacanya. (HR. Muslim)",
    "Hati yang tidak ada sedikitpun Al-Qur'an di dalamnya bagaikan rumah yang roboh. (HR. Tirmidzi)",
    "Orang yang mahir membaca Al-Qur'an akan bersama para malaikat yang mulia dan taat. (HR. Muslim)",
    "Allah mengangkat derajat beberapa kaum dengan Al-Qur'an ini dan merendahkan yang lain dengannya. (HR. Muslim)",
    "Jadikanlah Al-Quran sebagai pedoman hidup, niscaya hidupmu akan terarah dan tenang.",
    "Jangan lupa untuk murojaah hafalanmu, karena ilmu yang tidak dijaga akan mudah hilang.",
    "Menghafal Al-Quran itu mudah bagi yang ikhlas, jagalah niatmu karena Allah.",
    "Satu huruf yang dibaca dari Al-Quran mengandung sepuluh kebaikan.",
    "Al-Quran adalah obat bagi hati yang gelisah dan penyejuk bagi jiwa yang gundah.",
    "Jangan menunggu waktu luang untuk membaca Al-Quran, tapi luangkanlah waktumu.",
    "Keindahan Al-Quran bukan hanya pada suaranya, tapi pada pengamalannya dalam kehidupan sehari-hari.",
    "Rumah yang dibacakan Al-Quran akan dihadiri malaikat dan dijauhi setan.",
    "Istiqomah dalam membaca Al-Quran lebih baik daripada seribu karomah.",
    "Barangsiapa yang membaca satu huruf dari Kitabullah, maka dia akan mendapat satu kebaikan, dan satu kebaikan itu dibalas dengan sepuluh kali lipatnya. (HR. Tirmidzi)",
    "Penghafal Al-Quran adalah keluarga Allah di bumi.",
    "Cahaya Al-Quran mampu menerangi kegelapan hati dan pikiran.",
    "Semakin dekat kita dengan Al-Quran, semakin dekat kita dengan kebahagiaan.",
    "Al-Quran adalah surat cinta dari Allah, bacalah dengan penuh kasih sayang.",
    "Tidak ada kata terlambat untuk mulai belajar membaca dan memahami Al-Quran.",
    "Ilmu itu didapat dengan belajar, dan keberkahan didapat dengan Al-Quran.",
    "Hiasilah suaramu dengan Al-Quran.",
    "Al-Quran itu pemberi syafaat yang syafaatnya diterima.",
    "Orang yang dalam hatinya tidak ada Al-Quran laksana rumah kosong.",
    "Bersabarlah dalam menuntut ilmu Al-Quran, karena buahnya manis di akhirat."
];

export const getRandomAdvice = (): string => {
    // Generate a fresh random index every time called
    const randomIndex = Math.floor(Math.random() * ADVICE_LIST.length);
    return ADVICE_LIST[randomIndex];
};
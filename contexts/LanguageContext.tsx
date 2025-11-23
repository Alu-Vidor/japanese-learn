import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ru';

export const translations = {
  en: {
    learn: 'Learn',
    shadowing: 'Shadowing',
    progress: 'Progress',
    settings: 'Settings',
    welcome: 'Hello! Ready to learn?',
    selectLevel: 'Select your JLPT level and a topic to generate a personalized lesson.',
    suggestedTopics: 'Suggested Topics for',
    startLesson: 'Start Lesson',
    tryNow: 'Try Now',
    shadowingPromo: 'Improve your intonation by mimicking native speakers.',
    generating: 'Generating AI Lesson...',
    crafting: 'Crafting a dialogue about',
    dialogue: 'Dialogue',
    grammar: 'Grammar',
    quiz: 'Quiz',
    speaking: 'Speaking',
    nextLine: 'Next Line',
    startGrammar: 'Start Grammar',
    grammarFocus: 'Grammar Focus',
    takeQuiz: 'Take Quiz',
    quickCheck: 'Quick Check',
    checkAnswers: 'Check Answers',
    nextSpeaking: 'Next: Speaking',
    finishLesson: 'Finish Lesson',
    tryAgain: 'Try Again',
    speakingPractice: 'Speaking Practice',
    listen: 'Listen',
    hearReference: 'Hear Reference',
    record: 'Tap to Record',
    recording: 'Recording... Tap to stop',
    tapToRecord: 'Tap to Record',
    analyzing: 'Analyzing pronunciation...',
    shadowingTitle: 'Shadowing Practice (AI TTS)',
    shadowingDesc: 'Enter Japanese text below. The AI will generate native-sounding speech for you to shadow (repeat immediately after hearing).',
    generateAudio: 'Generate Audio',
    generatingAudio: 'Generating Audio...',
    yourProgress: 'Your Progress',
    lessonsCompleted: 'Lessons Completed',
    dayStreak: 'Day Streak',
    currentLevel: 'Current Level',
    skillBreakdown: 'Skill Breakdown',
    pitch: 'Pitch',
    timing: 'Timing',
    vowels: 'Vowels',
    topic_daily: 'Daily Life',
    topic_business: 'Business',
    topic_travel: 'Travel',
    topic_home: 'At Home',
    topic_school: 'School',
    topic_desc_daily: 'Practice vocabulary and grammar related to daily life.',
    topic_desc_business: 'Practice vocabulary and grammar related to business.',
    topic_desc_travel: 'Practice vocabulary and grammar related to travel.',
    topic_desc_home: 'Practice vocabulary and grammar related to home.',
    topic_desc_school: 'Practice vocabulary and grammar related to school.',
    backToDashboard: 'Back to Dashboard',
    score: 'Score',
    feedback: 'Feedback',
    transcription: 'Transcription',
    issuesDetected: 'Issues Detected',
    example: 'Example:',
    explanation: 'Explanation:',
    correct: 'Correct:',
    typeAnswer: 'Type your answer...',
    nextSentence: 'Next Sentence',
    loading: 'Loading...',
    failedToLoad: 'Failed to load lesson. Please check your API key or try again.',
    analysisFailed: 'Analysis failed.',
    micRequired: 'Microphone access is required.',
    gramamrMistake: 'Grammar',
    for: 'for'
  },
  ru: {
    learn: 'Учиться',
    shadowing: 'Теневой повтор',
    progress: 'Прогресс',
    settings: 'Настройки',
    welcome: 'Привет! Готовы учиться?',
    selectLevel: 'Выберите уровень JLPT и тему для урока.',
    suggestedTopics: 'Темы для',
    startLesson: 'Начать',
    tryNow: 'Попробовать',
    shadowingPromo: 'Улучшите интонацию, повторяя за носителем.',
    generating: 'Создание урока...',
    crafting: 'Пишем диалог на тему',
    dialogue: 'Диалог',
    grammar: 'Грамматика',
    quiz: 'Тест',
    speaking: 'Говорение',
    nextLine: 'Далее',
    startGrammar: 'К грамматике',
    grammarFocus: 'Грамматика',
    takeQuiz: 'Пройти тест',
    quickCheck: 'Проверка',
    checkAnswers: 'Проверить',
    nextSpeaking: 'Далее: Говорение',
    finishLesson: 'Завершить',
    tryAgain: 'Ещё раз',
    speakingPractice: 'Практика речи',
    listen: 'Слушать',
    hearReference: 'Послушать эталон',
    record: 'Нажмите для записи',
    recording: 'Запись... Нажмите стоп',
    tapToRecord: 'Нажмите для записи',
    analyzing: 'Анализ произношения...',
    shadowingTitle: 'Теневой повтор (AI TTS)',
    shadowingDesc: 'Введите текст на японском. ИИ озвучит его для тренировки повторения.',
    generateAudio: 'Озвучить',
    generatingAudio: 'Генерация...',
    yourProgress: 'Ваш прогресс',
    lessonsCompleted: 'Уроков',
    dayStreak: 'Дней подряд',
    currentLevel: 'Уровень',
    skillBreakdown: 'Навыки',
    pitch: 'Тон',
    timing: 'Ритм',
    vowels: 'Гласные',
    topic_daily: 'Повседневная жизнь',
    topic_business: 'Бизнес',
    topic_travel: 'Путешествия',
    topic_home: 'Дом',
    topic_school: 'Учёба',
    topic_desc_daily: 'Слова и грамматика для обычной жизни.',
    topic_desc_business: 'Деловой японский и этикет.',
    topic_desc_travel: 'Фразы для туристов и поездок.',
    topic_desc_home: 'Бытовая лексика.',
    topic_desc_school: 'Лексика для школы и университета.',
    backToDashboard: 'В меню',
    score: 'Оценка',
    feedback: 'Отзыв',
    transcription: 'Транскрипция',
    issuesDetected: 'Ошибки',
    example: 'Пример:',
    explanation: 'Пояснение:',
    correct: 'Верно:',
    typeAnswer: 'Введите ответ...',
    nextSentence: 'След. фраза',
    loading: 'Загрузка...',
    failedToLoad: 'Не удалось загрузить урок. Проверьте API ключ или повторите попытку.',
    analysisFailed: 'Ошибка анализа.',
    micRequired: 'Требуется доступ к микрофону.',
    gramamrMistake: 'Грамматика',
    for: 'для'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
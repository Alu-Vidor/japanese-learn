import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateLesson, generateSpeech, analyzePronunciation } from '../services/geminiService';
import { JLPTLevel, Lesson, PronunciationFeedback } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { AudioRecorder } from '../components/AudioRecorder';
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, Volume2, Sparkles, Book } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type Step = 'loading' | 'dialogue' | 'grammar' | 'quiz' | 'speaking' | 'feedback';

export const LessonView: React.FC = () => {
  const { level, topic } = useParams<{ level: string; topic: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [step, setStep] = useState<Step>('loading');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [speechCache, setSpeechCache] = useState<{[key: string]: string}>({});
  
  // Speaking state
  const [speakingLineIndex, setSpeakingLineIndex] = useState(0);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const data = await generateLesson((level as JLPTLevel) || JLPTLevel.N5, topic || 'General', language);
        setLesson(data);
        setStep('dialogue');
        // Pre-fetch audio for the first line
        prefetchAudio(data.dialogue[0].japanese, 0);
      } catch (error) {
        console.error("Failed to load lesson", error);
        alert(t('failedToLoad'));
        navigate('/');
      }
    };
    loadLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, topic, language]);

  const prefetchAudio = async (text: string, index: number) => {
    if (speechCache[index]) return;
    try {
      const url = await generateSpeech(text, index % 2 === 0 ? 'Kore' : 'Fenrir'); // Alternating voices
      setSpeechCache(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      console.warn("TTS failed for line", index);
    }
  };

  const handleNextLine = () => {
    if (!lesson) return;
    if (currentLineIndex < lesson.dialogue.length - 1) {
      const nextIndex = currentLineIndex + 1;
      setCurrentLineIndex(nextIndex);
      prefetchAudio(lesson.dialogue[nextIndex].japanese, nextIndex);
    } else {
      setStep('grammar');
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleSpeakingComplete = async (blob: Blob) => {
    if (!lesson) return;
    setIsAnalyzing(true);
    try {
      const targetText = lesson.dialogue[speakingLineIndex].japanese;
      const result = await analyzePronunciation(blob, targetText, language);
      setFeedback(result);
    } catch (e) {
      console.error(e);
      alert(t('analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDialogue = () => {
    if (!lesson) return null;
    const currentLine = lesson.dialogue[currentLineIndex];

    return (
      <div className="flex flex-col h-full justify-center items-center space-y-8 animate-in slide-in-from-right duration-500">
         <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl border border-yomi-100">
             <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-yomi-500 tracking-wider uppercase">{t('dialogue')} Part {currentLineIndex + 1}/{lesson.dialogue.length}</span>
                <AudioPlayer src={speechCache[currentLineIndex]} autoPlay label={t('listen')} />
             </div>
             
             <div className="space-y-4 text-center">
                 <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 mb-2">
                     {currentLine.speaker}
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-relaxed">
                     {currentLine.japanese}
                 </h2>
                 <p className="text-lg text-yomi-600 font-medium">{currentLine.reading}</p>
                 <p className="text-gray-400 italic mt-4">{currentLine.english}</p>
             </div>
         </div>

         <button 
           onClick={handleNextLine}
           className="bg-yomi-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-yomi-700 transition-all flex items-center gap-2 hover:gap-4"
         >
           {currentLineIndex === lesson.dialogue.length - 1 ? t('startGrammar') : t('nextLine')}
           <ChevronRight />
         </button>
      </div>
    );
  };

  const renderGrammar = () => {
    if (!lesson) return null;
    return (
      <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book className="text-yomi-500" />
            {t('grammarFocus')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
            {lesson.grammarPoints.map((point, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md">
                    <h3 className="text-xl font-bold text-yomi-600 mb-2">{point.structure}</h3>
                    <p className="text-gray-700 mb-4">{point.explanation}</p>
                    <div className="bg-yomi-50 p-4 rounded-xl text-sm">
                        <span className="font-bold text-yomi-800">{t('example')}</span> {point.example}
                    </div>
                </div>
            ))}
        </div>
        <div className="flex justify-end pt-8">
            <button onClick={() => setStep('quiz')} className="bg-yomi-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-yomi-700">
                {t('takeQuiz')}
            </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!lesson) return null;
    return (
        <div className="space-y-8 animate-in fade-in max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center">{t('quickCheck')}</h2>
            {lesson.quiz.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q.type}</span>
                        <p className="text-lg font-medium mt-1">{q.question}</p>
                    </div>

                    {q.type === 'multiple-choice' && (
                        <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                                <button 
                                    key={oIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => setQuizAnswers(prev => ({...prev, [idx]: opt}))}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        quizSubmitted 
                                            ? opt === q.correctAnswer 
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : quizAnswers[idx] === opt ? 'border-red-500 bg-red-50' : 'border-gray-100'
                                            : quizAnswers[idx] === opt ? 'border-yomi-500 bg-yomi-50' : 'border-gray-100 hover:border-yomi-200'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {(q.type === 'fill-gap' || q.type === 'scramble') && (
                         <div className="space-y-2">
                            <input 
                                type="text"
                                disabled={quizSubmitted}
                                onChange={(e) => setQuizAnswers(prev => ({...prev, [idx]: e.target.value}))}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-yomi-500 outline-none"
                                placeholder={t('typeAnswer')}
                            />
                            {quizSubmitted && (
                                <div className="text-sm text-green-600 font-medium">{t('correct')} {q.correctAnswer}</div>
                            )}
                         </div>
                    )}

                    {quizSubmitted && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            <strong>{t('explanation')}</strong> {q.explanation}
                        </div>
                    )}
                </div>
            ))}
            
            <div className="flex justify-center gap-4 pt-4">
                 {!quizSubmitted ? (
                     <button onClick={handleQuizSubmit} className="bg-yomi-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                        {t('checkAnswers')}
                     </button>
                 ) : (
                     <button onClick={() => setStep('speaking')} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
                        {t('nextSpeaking')} <ChevronRight size={18} />
                     </button>
                 )}
            </div>
        </div>
    )
  }

  const renderSpeaking = () => {
      if (!lesson) return null;
      const targetLine = lesson.dialogue[speakingLineIndex];

      return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-500">{t('speakingPractice')}</h2>
                  <p className="text-3xl font-bold">{targetLine.japanese}</p>
                  <p className="text-gray-400">{targetLine.reading}</p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[300px]">
                  {!feedback ? (
                      <>
                        <AudioRecorder onRecordingComplete={handleSpeakingComplete} isAnalyzing={isAnalyzing} />
                        <div className="mt-8 w-full flex justify-center">
                            <AudioPlayer src={speechCache[speakingLineIndex]} label={t('hearReference')} />
                        </div>
                      </>
                  ) : (
                      <div className="w-full space-y-6">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                              <div className="text-center">
                                  <div className="text-4xl font-bold text-yomi-600">{feedback.score}</div>
                                  <div className="text-xs text-gray-400 uppercase">{t('score')}</div>
                              </div>
                              <div className="text-center">
                                  <div className={`text-4xl font-bold ${feedback.pitchAccuracy > 80 ? 'text-green-500' : 'text-orange-500'}`}>
                                      {feedback.pitchAccuracy}%
                                  </div>
                                  <div className="text-xs text-gray-400 uppercase">{t('pitch')}</div>
                              </div>
                          </div>
                          
                          <div className="space-y-2">
                              <h4 className="font-bold text-gray-700">{t('transcription')}</h4>
                              <p className="p-3 bg-gray-50 rounded-lg text-lg font-serif">{feedback.transcription}</p>
                          </div>

                          <div className="space-y-2">
                              <h4 className="font-bold text-gray-700">{t('feedback')}</h4>
                              <p className="text-sm text-gray-600">{feedback.feedback}</p>
                          </div>

                           <div className="space-y-2">
                              {feedback.mistakes.length > 0 && <h4 className="font-bold text-red-500 text-sm">{t('issuesDetected')}</h4>}
                              {feedback.mistakes.map((m, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                      <XCircle className="text-red-400 w-4 h-4 mt-0.5 shrink-0" />
                                      <div>
                                          <span className="font-bold text-gray-800">{m.part}:</span> {m.issue}. 
                                          <span className="text-green-600 block text-xs mt-1">Try: {m.suggestion}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          <button 
                             onClick={() => { setFeedback(null); }}
                             className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 mt-4"
                          >
                              {t('tryAgain')}
                          </button>
                           <button 
                             onClick={() => { 
                                 setFeedback(null);
                                 if (speakingLineIndex < lesson.dialogue.length - 1) {
                                     setSpeakingLineIndex(prev => prev + 1);
                                 } else {
                                     navigate('/stats'); // Finish
                                 }
                             }}
                             className="w-full py-3 bg-yomi-600 text-white font-bold rounded-xl hover:bg-yomi-700"
                          >
                              {speakingLineIndex < lesson.dialogue.length - 1 ? t('nextSentence') : t('finishLesson')}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 border-4 border-yomi-200 border-t-yomi-600 rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-gray-700">{t('generating')}</h2>
        <p className="text-gray-400">{t('crafting')} {topic}</p>
      </div>
    );
  }

  return (
    <div>
       <div className="mb-6">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-yomi-600 flex items-center gap-1 mb-2">
                <ArrowLeft size={16} /> {t('backToDashboard')}
            </button>
            <h1 className="text-xl font-bold text-gray-800">{lesson?.title}</h1>
            <div className="flex gap-2 mt-2">
                {[t('dialogue'), t('grammar'), t('quiz'), t('speaking')].map((s, i) => {
                     const stepMap = ['dialogue', 'grammar', 'quiz', 'speaking'];
                     const currentIdx = stepMap.indexOf(step);
                     const isActive = i <= currentIdx;
                     return (
                         <div key={s} className={`h-1 flex-1 rounded-full ${isActive ? 'bg-yomi-500' : 'bg-gray-200'}`} />
                     )
                })}
            </div>
       </div>

       {step === 'dialogue' && renderDialogue()}
       {step === 'grammar' && renderGrammar()}
       {step === 'quiz' && renderQuiz()}
       {step === 'speaking' && renderSpeaking()}
    </div>
  );
};
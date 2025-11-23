import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { AudioPlayer } from '../components/AudioPlayer';
import { Mic, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Shadowing: React.FC = () => {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    const handleGenerate = async () => {
        if (!text) return;
        setIsLoading(true);
        try {
            const url = await generateSpeech(text);
            setAudioUrl(url);
        } catch (e) {
            alert('Failed to generate audio');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-yomi-900 mb-4 flex items-center gap-2">
                    <Mic className="text-yomi-500" />
                    {t('shadowingTitle')}
                </h2>
                <p className="text-gray-500 mb-6">{t('shadowingDesc')}</p>

                <textarea
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-yomi-500 focus:ring-2 focus:ring-yomi-100 outline-none transition-all resize-none font-sans text-lg"
                    rows={4}
                    placeholder="Example: 今日はいい天気ですね。散歩に行きましょう。"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="flex justify-end mt-4">
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !text}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? t('generatingAudio') : (
                            <>
                                <Play size={18} fill="currentColor" />
                                {t('generateAudio')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {audioUrl && (
                <div className="bg-yomi-50 p-8 rounded-3xl border border-yomi-100 animate-in slide-in-from-bottom">
                    <h3 className="text-lg font-bold text-yomi-800 mb-4">Player</h3>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                        <AudioPlayer src={audioUrl} autoPlay={false} />
                        <div className="flex-1">
                            <div className="h-1 bg-gray-100 rounded-full w-full overflow-hidden">
                                <div className="h-full bg-yomi-500 w-0 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-yomi-700">
                        <strong>Tip:</strong> Try to match the speed and intonation exactly. Don't wait for the sentence to finish.
                    </div>
                </div>
            )}
        </div>
    );
};
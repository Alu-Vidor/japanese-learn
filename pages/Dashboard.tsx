import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JLPTLevel } from '../types';
import { Sparkles, Coffee, Briefcase, Plane, Home, GraduationCap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>(JLPTLevel.N5);
  const { t } = useLanguage();

  const TOPICS = [
    { id: 'daily', icon: Coffee, label: t('topic_daily'), desc: t('topic_desc_daily'), color: 'bg-orange-100 text-orange-600' },
    { id: 'business', icon: Briefcase, label: t('topic_business'), desc: t('topic_desc_business'), color: 'bg-blue-100 text-blue-600' },
    { id: 'travel', icon: Plane, label: t('topic_travel'), desc: t('topic_desc_travel'), color: 'bg-teal-100 text-teal-600' },
    { id: 'home', icon: Home, label: t('topic_home'), desc: t('topic_desc_home'), color: 'bg-green-100 text-green-600' },
    { id: 'school', icon: GraduationCap, label: t('topic_school'), desc: t('topic_desc_school'), color: 'bg-purple-100 text-purple-600' },
  ];

  const startLesson = (topic: string) => {
    navigate(`/lesson/${selectedLevel}/${topic}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-yomi-600 to-yomi-500 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">{t('welcome')}</h2>
        <p className="opacity-90">{t('selectLevel')}</p>
        
        <div className="flex flex-wrap gap-2 mt-6">
          {Object.values(JLPTLevel).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedLevel === level
                  ? 'bg-white text-yomi-600 shadow-md transform scale-105'
                  : 'bg-yomi-700/50 text-white hover:bg-yomi-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={20} />
          {t('suggestedTopics')} {selectedLevel}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.id}
                onClick={() => startLesson(topic.label)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl ${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{topic.label}</h4>
                <p className="text-sm text-gray-500 mt-1">{topic.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Promo for shadowing */}
      <div className="bg-gray-900 rounded-2xl p-6 text-gray-300 flex items-center justify-between">
         <div>
            <h4 className="text-white font-bold text-lg">Shadowing Mode</h4>
            <p className="text-sm mt-1">{t('shadowingPromo')}</p>
         </div>
         <button onClick={() => navigate('/shadowing')} className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100">
            {t('tryNow')}
         </button>
      </div>
    </div>
  );
};
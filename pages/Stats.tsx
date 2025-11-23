import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Flame, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Stats: React.FC = () => {
  const { t } = useLanguage();

  const data = [
    { name: t('pitch'), score: 85 },
    { name: t('timing'), score: 72 },
    { name: t('vowels'), score: 90 },
    { name: t('gramamrMistake'), score: 65 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
        <h2 className="text-3xl font-bold text-gray-900">{t('yourProgress')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                    <Trophy size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-500">{t('lessonsCompleted')}</div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Flame size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-500">{t('dayStreak')}</div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Target size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">N4</div>
                <div className="text-sm text-gray-500">{t('currentLevel')}</div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-bold mb-6">{t('skillBreakdown')}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 14, fontWeight: 500 }} />
                    <Tooltip cursor={{fill: '#f0f9ff'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};
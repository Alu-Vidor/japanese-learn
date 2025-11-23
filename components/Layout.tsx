import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Mic, BarChart2, User, Settings, Layers, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { path: '/', label: t('learn'), icon: BookOpen },
    { path: '/shadowing', label: t('shadowing'), icon: Mic },
    { path: '/stats', label: t('progress'), icon: BarChart2 },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-yomi-600 tracking-tight flex items-center gap-2">
            <Layers className="w-8 h-8" />
            YomiGaku
          </h1>
          <p className="text-xs text-gray-500 mt-1">Japanese Mastery AI</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-yomi-50 text-yomi-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
           <button 
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-yomi-600 w-full rounded-lg hover:bg-gray-50 transition-colors"
           >
            <Globe size={18} />
            {language === 'en' ? 'English' : 'Русский'}
           </button>
          <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-yomi-600 w-full">
            <Settings size={18} />
            {t('settings')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen relative">
        <header className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
           <h1 className="text-xl font-bold text-yomi-600 flex items-center gap-2">
            <Layers className="w-6 h-6" />
            YomiGaku
          </h1>
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1 text-xs font-bold text-yomi-600 bg-yomi-50 rounded-full border border-yomi-100"
           >
            {language === 'en' ? 'EN' : 'RU'}
           </button>
        </header>
        
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-30 flex justify-around p-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive ? 'text-yomi-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
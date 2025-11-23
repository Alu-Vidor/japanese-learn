import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LessonView } from './pages/LessonView';
import { Shadowing } from './pages/Shadowing';
import { Stats } from './pages/Stats';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lesson/:level/:topic" element={<LessonView />} />
            <Route path="/shadowing" element={<Shadowing />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
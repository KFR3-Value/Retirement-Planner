import { useState } from 'react';
import { Engine } from './components/Engine';
import { Dashboard } from './components/Dashboard';

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-900">Familie Frey - Finanzplanung</h1>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Übersicht (Dashboard)
              </button>
              <button
                onClick={() => setActiveTab('engine')}
                className={`${
                  activeTab === 'engine'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Detaillierte Planung
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' ? <Dashboard /> : <Engine />}
      </main>
    </div>
  );
};

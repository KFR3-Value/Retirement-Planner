import { useState, useRef } from 'react';
import { Engine } from './components/Engine';
import { Dashboard } from './components/Dashboard';
import { usePlanning } from './context/PlanningContext';

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine'>('dashboard');
  const { state, loadState } = usePlanning();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenario.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedState = JSON.parse(content);
        if (parsedState && typeof parsedState === 'object' && 'ahv' in parsedState) {
          loadState(parsedState);
          alert('Szenario erfolgreich geladen!');
        } else {
          alert('Ungültiges Dateiformat. Keine passenden Daten gefunden.');
        }
      } catch (err) {
        alert('Fehler beim Lesen der Datei. Ist es ein gültiges JSON/Text Format?');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-900">Familie Frey - Finanzplanung</h1>
              
              <div className="flex space-x-2 text-sm ml-6 border-l pl-6 border-gray-300">
                <button
                  onClick={handleExport}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
                >
                  Szenario speichern
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
                >
                  Szenario laden
                </button>
                <input
                  type="file"
                  accept=".txt,.json"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
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

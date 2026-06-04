import { useState, useRef } from 'react';
import { Engine } from './components/Engine';
import { Dashboard } from './components/Dashboard';
import { usePlanning } from './context/PlanningContext';
import { useUI } from './context/UIContext';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSettingsDrawer } from './components/GlobalSettingsDrawer';
import { LiveFeedbackBar } from './components/LiveFeedbackBar';
import { AffordabilityAuditor } from './components/AffordabilityAuditor';
import { SensitivityAnalysis } from './components/SensitivityAnalysis';
export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'auditor' | 'sensitivity'>('dashboard');
  const { state, loadState } = usePlanning();
  const { openSettingsModal, openDrawer } = useUI();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SettingsModal />
      <GlobalSettingsDrawer />
      <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-emerald-400 tracking-wide font-mono">
                Familie Frey <span className="text-slate-400 font-sans text-sm font-normal">| Finanzplanung</span>
              </h1>
              
              <div className="flex space-x-2 text-sm ml-6 border-l pl-6 border-slate-800">
                <button
                  onClick={handleExport}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-200 shadow-sm transition-all hover:scale-[1.02] duration-150 active:scale-[0.98]"
                >
                  Szenario speichern
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-slate-200 shadow-sm transition-all hover:scale-[1.02] duration-150 active:scale-[0.98]"
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
            <nav className="flex space-x-8 items-center">
              <button
                onClick={openDrawer}
                className="text-emerald-400 font-medium hover:text-emerald-355 transition-colors flex items-center hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Globale Annahmen
              </button>
              <div className="h-6 w-px bg-slate-800"></div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                Übersicht (Dashboard)
              </button>
              <button
                onClick={() => setActiveTab('engine')}
                className={`${
                  activeTab === 'engine'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                Detaillierte Planung
              </button>
              <button
                onClick={() => setActiveTab('auditor')}
                className={`${
                  activeTab === 'auditor'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                Tragbarkeits-Audit
              </button>
              <button
                onClick={() => setActiveTab('sensitivity')}
                className={`${
                  activeTab === 'sensitivity'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all`}
              >
                Sensitivitäts-Analyse
              </button>
            </nav>
          </div>
        </div>
      </header>
      <LiveFeedbackBar />


      <main className="flex-grow w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {state.scenarioOverrides.survivor && state.scenarioOverrides.survivor.deceasedPartner !== 'Keiner' && (
          <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-4 flex items-center justify-between shadow-lg mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-400 font-mono">Todesfall-Simulation AKTIV</h4>
                <p className="text-xs text-slate-300">
                  Die Berechnungen und Vermögensentwicklungen simulieren das Ableben von <strong className="text-amber-300">{state.scenarioOverrides.survivor.deceasedPartner}</strong> im Jahr <strong className="text-amber-300">{state.scenarioOverrides.survivor.deathYear}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => openSettingsModal(7)}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold rounded border border-amber-600/40 transition-colors whitespace-nowrap"
            >
              Einstellungen anpassen
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'engine' && <Engine />}
        {activeTab === 'auditor' && <AffordabilityAuditor />}
        {activeTab === 'sensitivity' && <SensitivityAnalysis />}
      </main>
    </div>
  );
};

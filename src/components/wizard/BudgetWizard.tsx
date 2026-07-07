import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { usePlanning, type PlanningState } from '../../context/PlanningContext';
import { Step1Welcome } from './Step1Welcome';
import { Step2Income } from './Step2Income';
import { Step3Expenses } from './Step3Expenses';
import { Step4Housing } from './Step4Housing';
import { Step5Assets } from './Step5Assets';
import { Step6Review } from './Step6Review';

interface BudgetWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetWizard: React.FC<BudgetWizardProps> = ({ isOpen, onClose }) => {
  const { state: globalState, loadState } = usePlanning();
  
  // Local state for the wizard to avoid committing until the end
  const [wizardState, setWizardState] = useState<PlanningState | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 6;

  // Initialize wizard state with a deep clone of the global state when opened
  useEffect(() => {
    if (isOpen) {
      setWizardState(JSON.parse(JSON.stringify(globalState)));
      setCurrentStep(1);
    } else {
      const timer = setTimeout(() => setWizardState(null), 300); // clear after animation
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen && !wizardState) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleFinish = () => {
    if (wizardState) {
      loadState(wizardState);
    }
    onClose();
  };

  const updateWizardState = (updates: Partial<PlanningState> | ((prev: PlanningState) => PlanningState)) => {
    setWizardState(prev => {
      if (!prev) return prev;
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight font-mono">Budget-Einrichtungsassistent</h2>
            <p className="text-sm text-slate-400 mt-1">Schritt {currentStep} von {totalSteps}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800/60">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950/40 scrollbar-thin">
          <div className="max-w-3xl mx-auto">
            {wizardState && (
              <>
                {currentStep === 1 && <Step1Welcome state={wizardState} updateState={updateWizardState} />}
                {currentStep === 2 && <Step2Income state={wizardState} updateState={updateWizardState} />}
                {currentStep === 3 && <Step3Expenses state={wizardState} updateState={updateWizardState} />}
                {currentStep === 4 && <Step4Housing state={wizardState} updateState={updateWizardState} />}
                {currentStep === 5 && <Step5Assets state={wizardState} updateState={updateWizardState} />}
                {currentStep === 6 && <Step6Review state={wizardState} />}
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 1 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              Weiter <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Fertigstellen & Speichern
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import { createContext, useContext, useState, ReactNode } from 'react';

export type ModalTab = 1 | 2 | 3 | 4 | 'all' | null;

interface UIContextType {
  activeModalTab: ModalTab;
  openSettingsModal: (tab: ModalTab) => void;
  closeSettingsModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>(null);
  
  return (
    <UIContext.Provider value={{
      activeModalTab,
      openSettingsModal: setActiveModalTab,
      closeSettingsModal: () => setActiveModalTab(null)
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};

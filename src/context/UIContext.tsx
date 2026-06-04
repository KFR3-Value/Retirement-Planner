import { createContext, useContext, useState, type ReactNode } from 'react';

export type ModalTab = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'all' | null;

interface UIContextType {
  activeModalTab: ModalTab;
  openSettingsModal: (tab: ModalTab) => void;
  closeSettingsModal: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeModalTab, setActiveModalTab] = useState<ModalTab>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  
  return (
    <UIContext.Provider value={{
      activeModalTab,
      openSettingsModal: setActiveModalTab,
      closeSettingsModal: () => setActiveModalTab(null),
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false)
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


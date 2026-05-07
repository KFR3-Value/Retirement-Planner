import { PlanningProvider } from './context/PlanningContext';
import { UIProvider } from './context/UIContext';
import { MainLayout } from './MainLayout';

function App() {
  return (
    <PlanningProvider>
      <UIProvider>
        <MainLayout />
      </UIProvider>
    </PlanningProvider>
  );
}

export default App;

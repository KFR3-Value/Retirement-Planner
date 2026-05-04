import { PlanningProvider } from './context/PlanningContext';
import { MainLayout } from './MainLayout';

function App() {
  return (
    <PlanningProvider>
      <MainLayout />
    </PlanningProvider>
  );
}

export default App;

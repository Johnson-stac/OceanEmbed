import { Routes, Route } from 'react-router-dom';
import PredictionPage from './PredictionPage';
import FisheriesPage from './pages/FisheriesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PredictionPage />} />
      <Route path="/fisheries" element={<FisheriesPage />} />
      <Route path="*" element={<PredictionPage />} />
    </Routes>
  );
}

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdsListPage } from '@/pages/AdsListPage';
import { AdDetailsPage } from '@/pages/AdDetailsPage';
import { StatsPage } from '@/pages/StatsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/list" replace />} />
        <Route path="/list" element={<AdsListPage />} />
        <Route path="/item/:id" element={<AdDetailsPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

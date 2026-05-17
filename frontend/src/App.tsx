import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { IncidentList } from './pages/IncidentList';
import { CreateIncident } from './pages/CreateIncident';
import { IncidentDetail } from './pages/IncidentDetail';
import { EditIncident } from './pages/EditIncident';
import { ProblemList } from './pages/ProblemList';
import { CreateProblem } from './pages/CreateProblem';
import { ProblemDetail } from './pages/ProblemDetail';
import { ChangeList } from './pages/ChangeList';
import { CreateChange } from './pages/CreateChange';
import { ChangeDetail } from './pages/ChangeDetail';
import { ReleaseList } from './pages/ReleaseList';
import { CreateRelease } from './pages/CreateRelease';
import { ReleaseDetail } from './pages/ReleaseDetail';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  const { t } = useTranslation();

  useEffect(() => {
    console.log("App component mounted and i18n ready:", t('common.dashboard'));
  }, [t]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
            <Route path="/incidents/:id/edit" element={<EditIncident />} />
            <Route path="/incidents/new" element={<CreateIncident />} />
            
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/new" element={<CreateProblem />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />

            <Route path="/changes" element={<ChangeList />} />
            <Route path="/changes/new" element={<CreateChange />} />
            <Route path="/changes/:id" element={<ChangeDetail />} />

            <Route path="/releases" element={<ReleaseList />} />
            <Route path="/releases/new" element={<CreateRelease />} />
            <Route path="/releases/:id" element={<ReleaseDetail />} />

            <Route path="/inventory" element={<div className="text-center py-20 text-slate-500">{t('common.inventory')} {t('common.coming_soon')}</div>} />
            <Route path="/search" element={<div className="text-center py-20 text-slate-500">{t('common.ai_search')} {t('common.coming_soon')}</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

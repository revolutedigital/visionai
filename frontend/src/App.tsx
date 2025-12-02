import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Skeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useWebVitals } from './hooks/useWebVitals';

// Lazy load de todas as páginas para Code Splitting
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ClientesPage = lazy(() => import('./pages/Clientes'));
const ClienteDetalhesPage = lazy(() => import('./pages/Clientes/ClienteDetalhesPage'));
const PipelinePage = lazy(() => import('./pages/Pipeline'));
const UploadPage = lazy(() => import('./pages/Upload'));
const ConfiguracoesPage = lazy(() => import('./pages/Configuracoes'));

// Loading fallback para páginas
function PageLoader() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton width="100%" height={200} variant="rounded" className="animate-pulse" />
      <Skeleton width="100%" height={400} variant="rounded" className="animate-pulse" />
    </div>
  );
}

function App() {
  // Monitorar Web Vitals (apenas em produção)
  useWebVitals(import.meta.env.PROD);

  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="clientes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientesPage />
                </Suspense>
              }
            />
            <Route
              path="clientes/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClienteDetalhesPage />
                </Suspense>
              }
            />
            <Route
              path="pipeline"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PipelinePage />
                </Suspense>
              }
            />
            <Route
              path="upload"
              element={
                <Suspense fallback={<PageLoader />}>
                  <UploadPage />
                </Suspense>
              }
            />
            <Route
              path="configuracoes"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ConfiguracoesPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

// Página 404
function NotFoundPage() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Página não encontrada</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold"
        >
          Voltar para Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;

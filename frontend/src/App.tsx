import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/error/ErrorBoundary';

// 코드 스플리팅으로 페이지 지연 로딩
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Products = lazy(() => import('./pages/Products').then(module => ({ default: module.Products })));
const Contacts = lazy(() => import('./pages/Contacts').then(module => ({ default: module.Contacts })));
const Send = lazy(() => import('./pages/Send').then(module => ({ default: module.Send })));
const SendMonitor = lazy(() => import('./pages/SendMonitor').then(module => ({ default: module.SendMonitor })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const TestPage = lazy(() => import('./pages/TestPage').then(module => ({ default: module.TestPage })));

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/send" element={<Send />} />
                <Route path="/send/:jobId/monitor" element={<SendMonitor />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
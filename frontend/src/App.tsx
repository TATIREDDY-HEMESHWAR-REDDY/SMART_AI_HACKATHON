import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/routes';
import { StudentProvider, useStudent } from '@/contexts/StudentContext';

const queryClient = new QueryClient();

const ERP_URL = import.meta.env.VITE_ERP_URL || 'http://localhost:3001';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, authorized } = useStudent();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc' }}>
        <p style={{ color: '#64748b' }}>Loading…</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc', gap: '16px', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🎓</div>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Access via CampusOS ERP</h1>
        <p style={{ color: '#64748b', maxWidth: '340px', margin: 0, lineHeight: '1.6' }}>
          Career OS is only accessible through the CampusOS student portal.<br />
          Please sign in to the ERP and click <strong>Career Portal</strong> from the sidebar.
        </p>
        <a
          href={ERP_URL}
          style={{ marginTop: '8px', padding: '10px 24px', background: '#2563eb', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
        >
          Go to CampusOS ERP →
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StudentProvider>
          <AuthGate>
            <AppRoutes />
          </AuthGate>
        </StudentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

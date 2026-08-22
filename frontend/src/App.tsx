import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/routes';
import { StudentProvider } from '@/contexts/StudentContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StudentProvider>
          <AppRoutes />
        </StudentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

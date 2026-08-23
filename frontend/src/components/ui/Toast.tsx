import { useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  type: ToastType;
}

let addToastGlobal: ((title: string, type?: ToastType) => void) | null = null;

export function toast(title: string, type: ToastType = 'success') {
  addToastGlobal?.(title, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastGlobal = (title, type = 'success') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, title, type }]);
      setTimeout(() => remove(id), 3500);
    };
    return () => { addToastGlobal = null; };
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: t.type === 'error' ? '#fef2f2' : t.type === 'info' ? '#eff6ff' : '#f0fdf4',
          border: `1px solid ${t.type === 'error' ? '#fca5a5' : t.type === 'info' ? '#93c5fd' : '#86efac'}`,
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: 260, maxWidth: 380,
          animation: 'slideIn 0.2s ease',
        }}>
          {t.type === 'error' ? <XCircle size={18} color="#ef4444" /> :
           t.type === 'info' ? <Info size={18} color="#3b82f6" /> :
           <CheckCircle size={18} color="#22c55e" />}
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500,
            color: t.type === 'error' ? '#b91c1c' : t.type === 'info' ? '#1d4ed8' : '#15803d' }}>
            {t.title}
          </span>
          <button onClick={() => remove(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.5 }}>
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'default', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const [show, setShow] = useState(false);

  // Trigger enter animation
  useState(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    default: '✦',
  };

  return (
    <div
      className={`toast toast-${toast.type} ${show ? 'toast-show' : ''}`}
      onClick={() => onRemove(toast.id)}
      role="alert"
      style={{ cursor: 'pointer' }}
    >
      <span style={{ fontSize: '1rem' }}>{icons[toast.type] || icons.default}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

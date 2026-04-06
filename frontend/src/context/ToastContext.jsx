import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let _addToast;
export function useToast() {
    return { toast: _addToast || (() => { }) };
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (msg, type = 'info') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    };

    _addToast = addToast;

    const icons = { success: CheckCircle, error: XCircle, info: Info };

    return (
        <>
            {children}
            {createPortal(
                <div className="toast-container">
                    {toasts.map(t => {
                        const Icon = icons[t.type] || Info;
                        const colors = { success: '#10b981', error: '#ef4444', info: '#0ea5e9' };
                        return (
                            <div key={t.id} className={`toast ${t.type}`}>
                                <Icon size={18} color={colors[t.type]} />
                                <span>{t.msg}</span>
                                <button
                                    onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </>
    );
}

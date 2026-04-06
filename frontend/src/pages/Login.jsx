import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Login() {
    const { login, loading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);

    const [searchParams] = useSearchParams();
    const isAdminLogin = searchParams.get('admin') === 'true';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form.email, form.password);
        if (result.success) {
            toast('Welcome back! 👋', 'success');
            // Re-read user from context/storage to check role, or just trust the context updates
            // A quick delay or reading from local storage helps since context might take a tick
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            
            if (currentUser?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/events');
            }
        } else {
            toast(result.message, 'error');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb orb-1" />
                <div className="auth-orb orb-2" />
            </div>
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon"><Zap size={20} fill="currentColor" /></div>
                    <span>EventPro</span>
                </div>
                <h1 className="auth-title">{isAdminLogin ? 'Admin Login' : 'Welcome back'}</h1>
                <p className="auth-sub">{isAdminLogin ? 'Sign in to the admin portal' : 'Sign in to your account'}</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrap">
                            <Mail size={16} className="input-icon" />
                            <input
                                type="email" required
                                className="form-input input-with-icon"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <Lock size={16} className="input-icon" />
                            <input
                                type={showPw ? 'text' : 'password'} required
                                className="form-input input-with-icon"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-hint">
                    <div className="demo-creds">
                        <strong>Demo Admin:</strong> admin@eventpro.com / admin123
                    </div>
                </div>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Sign up free</Link>
                </p>
            </div>
        </div>
    );
}

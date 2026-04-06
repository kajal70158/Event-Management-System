import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function Register() {
    const { register, loading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast('Password must be at least 6 characters', 'error');
        const result = await register(form.name, form.email, form.password);
        if (result.success) {
            toast('Account created! Welcome 🎉', 'success');
            navigate('/events');
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
                <h1 className="auth-title">Create account</h1>
                <p className="auth-sub">Join thousands of event lovers</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrap">
                            <User size={16} className="input-icon" />
                            <input type="text" required className="form-input input-with-icon"
                                placeholder="Jane Doe" value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrap">
                            <Mail size={16} className="input-icon" />
                            <input type="email" required className="form-input input-with-icon"
                                placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <Lock size={16} className="input-icon" />
                            <input type={showPw ? 'text' : 'password'} required className="form-input input-with-icon"
                                placeholder="Min 6 characters" value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                            <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

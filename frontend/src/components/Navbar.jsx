import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Zap, ChevronDown, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setDropdownOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span className="logo-text">EventPro</span>
                </Link>

                {/* Desktop Nav */}
                <div className="navbar-links">
                    <Link to="/events" className={`nav-link ${isActive('/events') ? 'active' : ''}`}>Explore Events</Link>
                    {user && <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>My Tickets</Link>}
                    {isAdmin && <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>Admin Panel</Link>}
                </div>

                {/* Auth */}
                <div className="navbar-auth">
                    {user ? (
                        <div className="user-menu" onClick={() => setDropdownOpen(o => !o)}>
                            <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                            <span className="user-name">{user.name?.split(' ')[0]}</span>
                            <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                            {dropdownOpen && (
                                <div className="dropdown">
                                    <Link to="/dashboard" className="dropdown-item">
                                        <LayoutDashboard size={15} /> My Dashboard
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="dropdown-item">
                                            <Settings size={15} /> Admin Panel
                                        </Link>
                                    )}
                                    <hr className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item danger">
                                        <LogOut size={15} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login?admin=true" className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Admin</Link>
                            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button className="mobile-toggle" onClick={() => setMobileOpen(o => !o)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="mobile-menu">
                    <Link to="/events" className="mobile-link">Explore Events</Link>
                    {user && <Link to="/dashboard" className="mobile-link">My Tickets</Link>}
                    {isAdmin && <Link to="/admin" className="mobile-link">Admin Panel</Link>}
                    {user ? (
                        <button onClick={handleLogout} className="mobile-link danger-link">Log Out</button>
                    ) : (
                        <div className="mobile-auth">
                            <Link to="/login" className="btn btn-secondary btn-full">Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-full">Sign Up Free</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}

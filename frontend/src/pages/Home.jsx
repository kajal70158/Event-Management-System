import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Users, Globe, Star, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import './Home.css';

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/events?featured=true&limit=3').then(r => {
            setFeatured(r.data.events || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const stats = [
        { number: '12K+', label: 'Events Hosted', icon: CalendarDays },
        { number: '280K+', label: 'Happy Attendees', icon: Users },
        { number: '60+', label: 'Countries', icon: Globe },
        { number: '4.9★', label: 'Avg. Rating', icon: Star },
    ];

    const categories = [
        { name: 'Conference', icon: '🎤', color: '#6366f1' },
        { name: 'Music', icon: '🎵', color: '#ec4899' },
        { name: 'Technology', icon: '💻', color: '#10b981' },
        { name: 'Sports', icon: '🏆', color: '#f59e0b' },
        { name: 'Art & Culture', icon: '🎨', color: '#8b5cf6' },
        { name: 'Food & Drink', icon: '🍷', color: '#ef4444' },
        { name: 'Networking', icon: '🤝', color: '#0ea5e9' },
        { name: 'Workshop', icon: '🛠️', color: '#f97316' },
    ];

    return (
        <div className="home-page">
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-orb orb-1" />
                    <div className="hero-orb orb-2" />
                    <div className="hero-orb orb-3" />
                    <div className="hero-grid" />
                </div>
                <div className="container hero-content">
                    <div className="hero-tag">✨ The Event Platform of the Future</div>
                    <h1 className="hero-title">
                        Discover & Host<br />
                        <span className="gradient-text">Extraordinary</span><br />
                        Events
                    </h1>
                    <p className="hero-subtitle">
                        From intimate workshops to massive conferences — find your next unforgettable experience or create one for thousands.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Log In
                        </Link>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Sign Up
                        </Link>
                        <Link to="/login?admin=true" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                            Admin Login
                        </Link>
                    </div>
                    <div className="hero-scroll-hint">
                        <div className="scroll-dot" />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section-sm" style={{ background: 'var(--bg-surface)' }}>
                <div className="container">
                    <div className="stats-grid">
                        {stats.map(s => (
                            <div key={s.label} className="stat-card">
                                <s.icon size={28} style={{ color: 'var(--primary-light)', marginBottom: 8 }} />
                                <div className="stat-number">{s.number}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Events */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">🔥 Hot Right Now</div>
                        <h2 className="section-title">Featured <span className="gradient-text">Events</span></h2>
                        <p className="section-subtitle">Hand-picked events you won't want to miss.</p>
                    </div>
                    {loading ? (
                        <div className="events-grid">
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 380, borderRadius: 'var(--radius-lg)' }} className="skeleton" />
                            ))}
                        </div>
                    ) : featured.length > 0 ? (
                        <div className="events-grid">
                            {featured.map(ev => <EventCard key={ev.id} event={ev} />)}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No featured events yet.</p>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                        <Link to="/events" className="btn btn-outline btn-lg">
                            View All Events <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section" style={{ background: 'var(--bg-surface)' }}>
                <div className="container">
                    <div className="section-header">
                        <div className="section-tag">Browse by Category</div>
                        <h2 className="section-title">Find Your <span className="gradient-text">Vibe</span></h2>
                    </div>
                    <div className="categories-grid">
                        {categories.map(c => (
                            <Link
                                key={c.name}
                                to={`/events?category=${encodeURIComponent(c.name)}`}
                                className="category-card"
                                style={{ '--cat-color': c.color }}
                            >
                                <span className="cat-icon">{c.icon}</span>
                                <span className="cat-name">{c.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-bg" />
                <div className="container cta-content">
                    <h2 className="section-title">Ready to Host Your<br /><span className="gradient-text">Next Event?</span></h2>
                    <p className="section-subtitle">Join thousands of organizers who trust EventPro to sell tickets, manage registrations, and delight attendees.</p>
                    <div className="hero-actions" style={{ marginTop: 32 }}>
                        <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                        <Link to="/events" className="btn btn-secondary btn-lg">Browse Events</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-inner">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        © 2026 EventPro. Built with ❤️ for event lovers everywhere.
                    </p>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

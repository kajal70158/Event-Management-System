import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, MapPin, Ticket, CheckCircle, Clock, Tag, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventPass from '../components/EventPass';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPass, setSelectedPass] = useState(null);

    const fetchRegistrations = () => {
        setLoading(true);
        api.get('/registrations/my').then(r => setRegistrations(r.data)).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRegistrations();
        // Check for payment success
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            toast('🎉 Payment successful! Your ticket is confirmed.', 'success');
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    const handleCancel = async (regId) => {
        if (!confirm('Cancel this registration?')) return;
        try {
            await api.delete(`/registrations/${regId}`);
            setRegistrations(r => r.filter(x => x.id !== regId));
            toast('Registration cancelled', 'info');
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to cancel', 'error');
        }
    };

    const upcoming = registrations.filter(r => new Date(r.start_date) >= new Date());
    const past = registrations.filter(r => new Date(r.start_date) < new Date());

    const statusColors = { free: '#10b981', completed: '#6366f1', pending: '#f59e0b', refunded: '#ef4444' };
    const statusLabels = { free: 'Confirmed', completed: 'Paid', pending: 'Pending Payment', refunded: 'Refunded' };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dash-header">
                    <div>
                        <h1 className="section-title" style={{ marginBottom: 6 }}>
                            My <span className="gradient-text">Dashboard</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name?.split(' ')[0]}!</p>
                    </div>
                    <Link to="/events" className="btn btn-primary">
                        <Calendar size={16} /> Browse Events
                    </Link>
                </div>

                {/* Stats row */}
                <div className="dash-stats">
                    <div className="dash-stat">
                        <Ticket size={24} style={{ color: 'var(--primary-light)' }} />
                        <div>
                            <div className="dash-stat-num">{registrations.length}</div>
                            <div className="dash-stat-label">Total Registrations</div>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <Clock size={24} style={{ color: '#10b981' }} />
                        <div>
                            <div className="dash-stat-num">{upcoming.length}</div>
                            <div className="dash-stat-label">Upcoming Events</div>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <CheckCircle size={24} style={{ color: '#f59e0b' }} />
                        <div>
                            <div className="dash-stat-num">{past.length}</div>
                            <div className="dash-stat-label">Events Attended</div>
                        </div>
                    </div>
                </div>

                {/* Upcoming */}
                <section>
                    <h2 className="dash-section-title">Upcoming Events</h2>
                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : upcoming.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 0' }}>
                            <span style={{ fontSize: '2.5rem' }}>🎟️</span>
                            <h3>No upcoming events</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Register for an event to see it here.</p>
                            <Link to="/events" className="btn btn-primary">Find Events</Link>
                        </div>
                    ) : (
                        <div className="reg-list">
                            {upcoming.map(r => <RegCard key={r.id} reg={r} onCancel={handleCancel} onViewPass={() => setSelectedPass(r)} statusColors={statusColors} statusLabels={statusLabels} />)}
                        </div>
                    )}
                </section>

                {/* Past */}
                {past.length > 0 && (
                    <section style={{ marginTop: 40 }}>
                        <h2 className="dash-section-title">Past Events</h2>
                        <div className="reg-list">
                            {past.map(r => <RegCard key={r.id} reg={r} onCancel={null} onViewPass={() => setSelectedPass(r)} past statusColors={statusColors} statusLabels={statusLabels} />)}
                        </div>
                    </section>
                )}
            </div>

            {/* Pass Modal */}
            {selectedPass && (
                <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
                    <div className="modal-content pass-modal" onClick={e => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', maxWidth: '800px' }}>
                        <button className="modal-close" onClick={() => setSelectedPass(null)} style={{ background: 'white', color: 'black', top: -10, right: 0 }}>
                            <X size={20} />
                        </button>
                        <EventPass reg={selectedPass} user={user} />
                        <div style={{ textAlign: 'center', marginTop: 15 }}>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                Print Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RegCard({ reg, onCancel, onViewPass, past, statusColors, statusLabels }) {
    const isConfirmed = reg.payment_status === 'free' || reg.payment_status === 'completed';

    return (
        <div className={`reg-card ${past ? 'past' : ''}`}>
            <div className="reg-image">
                <img src={reg.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=60'} alt={reg.title} />
            </div>
            <div className="reg-info">
                {reg.category_name && (
                    <div className="category-badge" style={{ background: `${reg.category_color || '#6366f1'}22`, color: reg.category_color || '#818cf8', borderColor: `${reg.category_color || '#6366f1'}44`, border: '1px solid', marginBottom: 6, width: 'fit-content', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={10} />{reg.category_name}
                    </div>
                )}
                <h3 className="reg-title">{reg.title}</h3>
                <div className="reg-meta">
                    <span><Calendar size={13} /> {format(new Date(reg.start_date), 'EEE, MMM d, yyyy')}</span>
                    <span><Clock size={13} /> {format(new Date(reg.start_date), 'h:mm a')}</span>
                    <span><MapPin size={13} /> {reg.location}</span>
                </div>
                <div className="reg-footer">
                    <div className="reg-ticket-info">
                        <Ticket size={14} /> {reg.ticket_count} ticket{reg.ticket_count > 1 ? 's' : ''}
                        {reg.total_paid > 0 && ` · $${Number(reg.total_paid).toFixed(2)} paid`}
                    </div>
                    <span className="reg-status" style={{ color: statusColors[reg.payment_status] || '#94a3b8', background: `${statusColors[reg.payment_status]}22`, padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                        {statusLabels[reg.payment_status] || reg.payment_status}
                    </span>
                </div>
            </div>
            <div className="reg-actions" style={{ flexDirection: 'column', gap: 8 }}>
                {isConfirmed ? (
                    <button className="btn btn-primary btn-sm" onClick={onViewPass} style={{ width: '100%' }}>
                        View Pass
                    </button>
                ) : (
                    <Link to={`/events/${reg.event_id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>View Event</Link>
                )}
                
                {onCancel && !past && (
                    <button className="btn btn-outline btn-sm" onClick={() => onCancel(reg.id)} style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
                        Cancel Run
                    </button>
                )}
            </div>
        </div>
    );
}

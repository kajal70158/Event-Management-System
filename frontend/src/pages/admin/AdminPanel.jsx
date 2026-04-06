import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Plus, Edit3, Trash2, X, Save, CheckCircle,
    Calendar, Users, DollarSign, BarChart3
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './AdminPanel.css';

const EMPTY_FORM = {
    title: '', short_description: '', description: '', category_id: '',
    location: '', venue: '', image_url: '', start_date: '', end_date: '',
    capacity: 100, price: 0, is_featured: false, status: 'published',
};

export default function AdminPanel() {
    const { isAdmin } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // event id or 'new'
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [evRes, catRes] = await Promise.all([
                api.get('/events?limit=100'),
                api.get('/events/categories'),
            ]);
            setEvents(evRes.data.events || []);
            setCategories(catRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => { setForm(EMPTY_FORM); setEditing('new'); };
    const openEdit = (ev) => {
        setForm({
            title: ev.title || '',
            short_description: ev.short_description || '',
            description: ev.description || '',
            category_id: ev.category_id || '',
            location: ev.location || '',
            venue: ev.venue || '',
            image_url: ev.image_url || '',
            start_date: ev.start_date ? ev.start_date.slice(0, 16) : '',
            end_date: ev.end_date ? ev.end_date.slice(0, 16) : '',
            capacity: ev.capacity || 100,
            price: ev.price || 0,
            is_featured: ev.is_featured || false,
            status: ev.status || 'published',
        });
        setEditing(ev.id);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                const { data } = await api.post('/events', form);
                setEvents(evs => [data, ...evs]);
                toast('Event created! ✅', 'success');
            } else {
                const { data } = await api.put(`/events/${editing}`, form);
                setEvents(evs => evs.map(ev => ev.id === editing ? data : ev));
                toast('Event updated! ✅', 'success');
            }
            setEditing(null);
        } catch (err) {
            toast(err.response?.data?.message || 'Save failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event? This cannot be undone.')) return;
        try {
            await api.delete(`/events/${id}`);
            setEvents(evs => evs.filter(ev => ev.id !== id));
            toast('Event deleted', 'info');
        } catch {
            toast('Delete failed', 'error');
        }
    };

    const f = (k, v) => setForm(fm => ({ ...fm, [k]: v }));

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1 className="section-title" style={{ marginBottom: 4 }}>
                            Admin <span className="gradient-text">Panel</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{events.length} events total</p>
                    </div>
                    <button className="btn btn-primary" onClick={openNew}>
                        <Plus size={18} /> Create Event
                    </button>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="admin-stat"><Calendar size={20} style={{ color: 'var(--primary-light)' }} /><span>{events.length}</span><small>Events</small></div>
                    <div className="admin-stat"><BarChart3 size={20} style={{ color: '#10b981' }} /><span>{events.filter(e => e.is_featured).length}</span><small>Featured</small></div>
                    <div className="admin-stat"><Users size={20} style={{ color: '#f59e0b' }} /><span>{events.reduce((a, e) => a + (e.registered_count || 0), 0)}</span><small>Registrations</small></div>
                    <div className="admin-stat"><DollarSign size={20} style={{ color: '#ec4899' }} /><span>${events.reduce((a, e) => a + (e.price * (e.registered_count || 0)), 0).toFixed(0)}</span><small>Revenue</small></div>
                </div>

                {/* Event list */}
                {loading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                ) : (
                    <div className="admin-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Registered</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id}>
                                        <td>
                                            <div className="admin-event-name">
                                                <img src={ev.image_url} alt="" className="admin-thumb" onError={e => e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=60&q=40'} />
                                                <div>
                                                    <p style={{ fontWeight: 600 }}>{ev.title}</p>
                                                    {ev.is_featured && <span className="admin-badge featured">Featured</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{format(new Date(ev.start_date), 'MMM d, yyyy')}</td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ev.category_name || '—'}</td>
                                        <td style={{ fontWeight: 600 }}>{ev.price > 0 ? `$${Number(ev.price).toFixed(2)}` : 'Free'}</td>
                                        <td>
                                            <div className="admin-reg-cell">
                                                <span>{ev.registered_count} / {ev.capacity}</span>
                                                <div className="mini-bar"><div className="mini-fill" style={{ width: `${Math.min((ev.registered_count / ev.capacity) * 100, 100)}%` }} /></div>
                                            </div>
                                        </td>
                                        <td><span className={`admin-status ${ev.status}`}>{ev.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)}><Edit3 size={14} /></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {editing && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
                    <div className="modal-box" style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                                {editing === 'new' ? '✨ Create Event' : '✏️ Edit Event'}
                            </h2>
                            <button className="modal-close" onClick={() => setEditing(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSave} className="event-form">
                                <div className="form-grid">
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Title *</label>
                                        <input className="form-input" value={form.title} required onChange={e => f('title', e.target.value)} placeholder="Amazing Event 2026" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Short Description</label>
                                        <input className="form-input" value={form.short_description} onChange={e => f('short_description', e.target.value)} placeholder="One-liner summary" maxLength={300} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Full Description</label>
                                        <textarea className="form-input form-textarea" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe your event..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-input form-select" value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                                            <option value="">— Select —</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-input form-select" value={form.status} onChange={e => f('status', e.target.value)}>
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Start Date & Time *</label>
                                        <input type="datetime-local" className="form-input" value={form.start_date} required onChange={e => f('start_date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date & Time *</label>
                                        <input type="datetime-local" className="form-input" value={form.end_date} required onChange={e => f('end_date', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input className="form-input" value={form.location} onChange={e => f('location', e.target.value)} placeholder="City, Country" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Venue</label>
                                        <input className="form-input" value={form.venue} onChange={e => f('venue', e.target.value)} placeholder="Venue name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price ($)</label>
                                        <input type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={e => f('price', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Capacity</label>
                                        <input type="number" min="1" className="form-input" value={form.capacity} onChange={e => f('capacity', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Image URL</label>
                                        <input className="form-input" value={form.image_url} onChange={e => f('image_url', e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="form-group form-checkbox">
                                        <label>
                                            <input type="checkbox" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)} />
                                            Featured Event (shown on homepage)
                                        </label>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save Event'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

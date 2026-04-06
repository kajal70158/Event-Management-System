import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import './Events.css';

export default function Events() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [upcoming, setUpcoming] = useState(searchParams.get('upcoming') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    const fetchEvents = useCallback(() => {
        setLoading(true);
        const params = { page, limit: 9 };
        if (search) params.search = search;
        if (category) params.category = category;
        if (upcoming) params.upcoming = 'true';
        api.get('/events', { params }).then(r => {
            setEvents(r.data.events);
            setTotal(r.data.total);
            setPages(r.data.pages);
        }).catch(() => setEvents([])).finally(() => setLoading(false));
    }, [search, category, upcoming, page]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);
    useEffect(() => { api.get('/events/categories').then(r => setCategories(r.data)); }, []);

    const applyFilter = (k, v) => {
        setPage(1);
        if (k === 'category') setCategory(v === category ? '' : v);
        if (k === 'upcoming') setUpcoming(u => u ? '' : 'true');
    };

    const clearFilters = () => { setSearch(''); setCategory(''); setUpcoming(''); setPage(1); };
    const hasFilters = search || category || upcoming;

    return (
        <div className="events-page">
            <div className="events-hero">
                <div className="container">
                    <div className="section-tag">🌎 All Events</div>
                    <h1 className="section-title" style={{ marginBottom: 8 }}>
                        Find Your Next <span className="gradient-text">Experience</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
                        {total} events awaiting you
                    </p>
                    {/* Search bar */}
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            className="search-input"
                            placeholder="Search events, locations, organizers..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                        {search && (
                            <button className="search-clear" onClick={() => { setSearch(''); setPage(1); }}>
                                <X size={16} />
                            </button>
                        )}
                        <button className="btn btn-secondary btn-sm filter-btn" onClick={() => setShowFilters(o => !o)}>
                            <SlidersHorizontal size={15} /> Filters
                        </button>
                    </div>

                    {/* Filter chips */}
                    {showFilters && (
                        <div className="filter-panel">
                            <div className="filter-section">
                                <span className="filter-label">Category</span>
                                <div className="filter-chips">
                                    {categories.map(c => (
                                        <button
                                            key={c.id}
                                            className={`chip ${category === c.name ? 'active' : ''}`}
                                            onClick={() => applyFilter('category', c.name)}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <span className="filter-label">Time</span>
                                <div className="filter-chips">
                                    <button className={`chip ${upcoming ? 'active' : ''}`} onClick={() => applyFilter('upcoming')}>
                                        Upcoming Only
                                    </button>
                                </div>
                            </div>
                            {hasFilters && (
                                <button className="btn btn-danger btn-sm" onClick={clearFilters}>
                                    <X size={14} /> Clear All
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="container events-layout">
                {/* Sidebar calendar */}
                <aside className="events-sidebar">
                    <CalendarView events={events} />
                </aside>

                {/* Main grid */}
                <main className="events-main">
                    {loading ? (
                        <div className="events-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ height: 380, borderRadius: 'var(--radius-lg)' }} className="skeleton" />
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <>
                            <div className="events-grid">
                                {events.map(ev => <EventCard key={ev.id} event={ev} />)}
                            </div>
                            {pages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <span className="page-info">Page {page} of {pages}</span>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={page >= pages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem' }}>🎭</div>
                            <h3>No events found</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms.</p>
                            <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

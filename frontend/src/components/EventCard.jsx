import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import './EventCard.css';

export default function EventCard({ event }) {
    const spotsLeft = event.capacity - event.registered_count;
    const soldOut = spotsLeft <= 0;
    const fillPct = Math.min((event.registered_count / event.capacity) * 100, 100);

    return (
        <Link to={`/events/${event.id}`} className="event-card">
            {/* Image */}
            <div className="ec-image-wrap">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80'}
                    alt={event.title}
                    className="ec-image"
                    loading="lazy"
                />
                <div className="ec-overlay" />
                {event.is_featured && <span className="ec-badge featured">⭐ Featured</span>}
                {soldOut && <span className="ec-badge sold-out">Sold Out</span>}
                <div className="ec-price-tag">
                    {event.price > 0 ? (
                        <span className="ec-price">${Number(event.price).toFixed(2)}</span>
                    ) : (
                        <span className="ec-price free">Free</span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="ec-body">
                {event.category_name && (
                    <div
                        className="category-badge"
                        style={{ background: `${event.category_color || '#6366f1'}22`, color: event.category_color || '#818cf8', borderColor: `${event.category_color || '#6366f1'}44` }}
                    >
                        <Tag size={11} />
                        {event.category_name}
                    </div>
                )}

                <h3 className="ec-title">{event.title}</h3>

                {event.short_description && (
                    <p className="ec-desc">{event.short_description}</p>
                )}

                <div className="ec-meta">
                    <div className="ec-meta-item">
                        <Calendar size={14} />
                        {format(new Date(event.start_date), 'MMM d, yyyy')}
                    </div>
                    <div className="ec-meta-item">
                        <MapPin size={14} />
                        {event.location?.split(',')[0]}
                    </div>
                </div>

                {/* Capacity bar */}
                <div className="ec-capacity">
                    <div className="ec-capacity-bar">
                        <div
                            className="ec-capacity-fill"
                            style={{
                                width: `${fillPct}%`,
                                background: soldOut ? '#ef4444' : fillPct > 80 ? '#f59e0b' : '#6366f1',
                            }}
                        />
                    </div>
                    <div className="ec-capacity-text">
                        <Users size={12} />
                        {soldOut ? 'Sold Out' : `${spotsLeft} spots left`}
                    </div>
                </div>
            </div>
        </Link>
    );
}

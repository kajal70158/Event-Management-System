import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import './CalendarView.css';

export default function CalendarView({ events = [] }) {
    const [viewDate, setViewDate] = useState(new Date());

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    const eventDays = events.map(e => new Date(e.start_date));

    const hasEvent = (day) => eventDays.some(ed => isSameDay(ed, day));

    const prev = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const next = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    return (
        <div className="calendar-widget">
            <div className="cal-header">
                <Calendar size={16} style={{ color: 'var(--primary-light)' }} />
                <span className="cal-title">{format(viewDate, 'MMMM yyyy')}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    <button className="cal-nav" onClick={prev}><ChevronLeft size={14} /></button>
                    <button className="cal-nav" onClick={next}><ChevronRight size={14} /></button>
                </div>
            </div>

            <div className="cal-weekdays">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="cal-wd">{d}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {/* Empty cells */}
                {[...Array(startDayOfWeek)].map((_, i) => (
                    <div key={`empty-${i}`} className="cal-day empty" />
                ))}
                {days.map(day => (
                    <div
                        key={day.toISOString()}
                        className={`cal-day ${hasEvent(day) ? 'has-event' : ''} ${isToday(day) ? 'today' : ''}`}
                        title={hasEvent(day) ? 'Events on this day' : ''}
                    >
                        {day.getDate()}
                    </div>
                ))}
            </div>

            {events.length > 0 && (
                <div className="cal-legend">
                    <div className="legend-item">
                        <div className="legend-dot event-dot" />
                        <span>Event day</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot today-dot" />
                        <span>Today</span>
                    </div>
                </div>
            )}
        </div>
    );
}

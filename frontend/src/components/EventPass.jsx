import { forwardRef } from 'react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import './EventPass.css';

const EventPass = forwardRef(({ reg, user }, ref) => {
    if (!reg) return null;

    // We encode the registration ID into the QR code.
    // In a real system, scanning this would hit an admin endpoint to verify the ticket.
    const qrData = JSON.stringify({
        regId: reg.id,
        eventId: reg.event_id,
        userId: user?.id
    });

    return (
        <div className="event-pass-wrapper" ref={ref}>
            <div className="event-pass">
                {/* Left Ticket Stub (Info) */}
                <div className="pass-left">
                    <div className="pass-header">
                        <div className="pass-brand">✨ EventPro Pass</div>
                        <div className="pass-status">
                            {reg.payment_status === 'free' ? 'FREE RSVP' : 'PREMIUM SECURED'}
                        </div>
                    </div>

                    <h2 className="pass-title">{reg.title}</h2>

                    <div className="pass-details">
                        <div className="detail-item">
                            <Calendar size={14} className="detail-icon" />
                            <div>
                                <div className="detail-label">Date</div>
                                <div className="detail-value">{format(new Date(reg.start_date), 'MMM d, yyyy')}</div>
                            </div>
                        </div>

                        <div className="detail-item">
                            <Clock size={14} className="detail-icon" />
                            <div>
                                <div className="detail-label">Time</div>
                                <div className="detail-value">{format(new Date(reg.start_date), 'h:mm a')}</div>
                            </div>
                        </div>

                        <div className="detail-item full-width">
                            <MapPin size={14} className="detail-icon" />
                            <div>
                                <div className="detail-label">Location</div>
                                <div className="detail-value">{reg.location}</div>
                            </div>
                        </div>
                    </div>

                    <div className="pass-attendee-info">
                        <div className="attendee-box">
                            <div className="detail-label">Attendee</div>
                            <div className="attendee-name">{user?.name}</div>
                            <div className="attendee-email">{user?.email}</div>
                        </div>
                        <div className="attendee-box text-right">
                            <div className="detail-label">Admit</div>
                            <div className="attendee-count">
                                <Ticket size={16} /> {reg.ticket_count}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Ticket Stub (QR Code) */}
                <div className="pass-right">
                    <div className="pass-tear-line"></div>
                    <div className="qr-container">
                        <QRCode
                            value={qrData}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="M"
                        />
                    </div>
                    <div className="pass-id">ID: {reg.id.split('-')[0]}</div>
                    <div className="pass-hint">Scan at entry</div>
                </div>
            </div>
        </div>
    );
});

EventPass.displayName = 'EventPass';
export default EventPass;

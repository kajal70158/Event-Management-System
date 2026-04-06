const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

// GET /api/registrations/my – user's registrations
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, e.title, e.start_date, e.end_date, e.location, e.image_url,
              e.price, c.name AS category_name, c.color AS category_color
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE r.user_id = $1
       ORDER BY e.start_date ASC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/registrations/event/:eventId (admin)
router.get('/event/:eventId', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.name AS user_name, u.email AS user_email
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1
       ORDER BY r.created_at DESC`,
            [req.params.eventId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/registrations – register for free event
router.post('/', authMiddleware, async (req, res) => {
    const { event_id, ticket_count = 1 } = req.body;
    if (!event_id) return res.status(400).json({ message: 'event_id required' });

    try {
        // Get event
        const evResult = await pool.query('SELECT * FROM events WHERE id=$1', [event_id]);
        if (evResult.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        const event = evResult.rows[0];

        if (event.price > 0) {
            return res.status(400).json({ message: 'This event requires payment. Use the checkout endpoint.' });
        }

        // Check capacity
        if (event.registered_count + ticket_count > event.capacity) {
            return res.status(400).json({ message: 'Not enough capacity remaining' });
        }

        // Check duplicate
        const dupCheck = await pool.query(
            'SELECT id FROM registrations WHERE user_id=$1 AND event_id=$2',
            [req.user.id, event_id]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Already registered for this event' });
        }

        // Register
        const result = await pool.query(
            `INSERT INTO registrations (user_id, event_id, ticket_count, total_paid, payment_status)
       VALUES ($1,$2,$3,0,'free') RETURNING *`,
            [req.user.id, event_id, ticket_count]
        );

        await pool.query(
            'UPDATE events SET registered_count = registered_count + $1 WHERE id = $2',
            [ticket_count, event_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/registrations/:id – cancel
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const reg = await pool.query(
            'SELECT * FROM registrations WHERE id=$1 AND user_id=$2',
            [req.params.id, req.user.id]
        );
        if (reg.rows.length === 0) return res.status(404).json({ message: 'Registration not found' });

        await pool.query('DELETE FROM registrations WHERE id=$1', [req.params.id]);
        await pool.query(
            'UPDATE events SET registered_count = registered_count - $1 WHERE id = $2',
            [reg.rows[0].ticket_count, reg.rows[0].event_id]
        );

        res.json({ message: 'Registration cancelled' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

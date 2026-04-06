const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/events – list with filters
router.get('/', async (req, res) => {
    const { category, search, upcoming, featured, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ["e.status = 'published'"];
    const params = [];

    if (category) {
        params.push(category);
        conditions.push(`c.name ILIKE $${params.length}`);
    }
    if (search) {
        params.push(`%${search}%`);
        conditions.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`);
    }
    if (upcoming === 'true') {
        conditions.push(`e.start_date > NOW()`);
    }
    if (featured === 'true') {
        conditions.push(`e.is_featured = TRUE`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    try {
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM events e LEFT JOIN categories c ON e.category_id=c.id ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await pool.query(
            `SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              u.name AS organizer_name
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       ${where}
       ORDER BY e.is_featured DESC, e.start_date ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        res.json({
            events: result.rows,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/events/categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              u.name AS organizer_name, u.email AS organizer_email
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/events – admin create
router.post('/', authMiddleware, adminOnly, async (req, res) => {
    const {
        title, description, short_description, category_id, location, venue,
        image_url, start_date, end_date, capacity, price, is_featured, status
    } = req.body;

    if (!title || !start_date || !end_date)
        return res.status(400).json({ message: 'Title, start_date, end_date are required' });

    try {
        const result = await pool.query(
            `INSERT INTO events (title, description, short_description, category_id, location, venue, 
        image_url, start_date, end_date, capacity, price, is_featured, organizer_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
            [title, description, short_description, category_id, location, venue,
                image_url, start_date, end_date, capacity || 100, price || 0,
                is_featured || false, req.user.id, status || 'published']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/events/:id – admin update
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
    const {
        title, description, short_description, category_id, location, venue,
        image_url, start_date, end_date, capacity, price, is_featured, status
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE events SET title=$1, description=$2, short_description=$3, category_id=$4,
        location=$5, venue=$6, image_url=$7, start_date=$8, end_date=$9,
        capacity=$10, price=$11, is_featured=$12, status=$13
       WHERE id=$14 RETURNING *`,
            [title, description, short_description, category_id, location, venue,
                image_url, start_date, end_date, capacity, price, is_featured, status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/events/:id – admin
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id=$1', [req.params.id]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields required' });

    try {
        const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
        if (exists.rows.length > 0)
            return res.status(409).json({ message: 'Email already registered' });

        const hash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id,name,email,role,created_at',
            [name, email, hash]
        );
        const user = result.rows[0];
        const token = signToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });

    try {
        const result = await pool.query(
            'SELECT id,name,email,role,password_hash FROM users WHERE email=$1',
            [email]
        );
        if (result.rows.length === 0)
            return res.status(401).json({ message: 'Invalid credentials' });

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const { password_hash: _, ...safeUser } = user;
        const token = signToken(safeUser);
        res.json({ token, user: safeUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/auth/me
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id,name,email,role,avatar_url,created_at FROM users WHERE id=$1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

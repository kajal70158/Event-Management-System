const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } else {
        console.warn('Razorpay keys not found in .env. Will use mock payment flow.');
    }
} catch (e) {
    console.warn('Razorpay initialization failed:', e);
}

// POST /api/payments/create-razorpay-order
router.post('/create-razorpay-order', authMiddleware, async (req, res) => {
    const { event_id, ticket_count = 1 } = req.body;
    if (!event_id) return res.status(400).json({ message: 'event_id required' });

    try {
        const evResult = await pool.query(
            `SELECT e.*, c.name AS category_name FROM events e
       LEFT JOIN categories c ON e.category_id = c.id WHERE e.id=$1`,
            [event_id]
        );
        if (evResult.rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        const event = evResult.rows[0];

        if (event.registered_count + ticket_count > event.capacity) {
            return res.status(400).json({ message: 'Not enough capacity remaining' });
        }

        const amountInPaise = Math.round(event.price * 100) * ticket_count;

        if (!razorpay) {
            // Mock payment flow when Razorpay is not configured
            const mockSessionId = 'mock_order_' + Date.now();
            
            await pool.query(
                `INSERT INTO registrations (user_id, event_id, ticket_count, total_paid, payment_status, stripe_session_id)
           VALUES ($1,$2,$3,$4,'completed',$5)
           ON CONFLICT (user_id, event_id) DO UPDATE SET stripe_session_id=$5, payment_status='completed', total_paid=$4`,
                [req.user.id, event_id, ticket_count, event.price * ticket_count, mockSessionId]
            );

            await pool.query(
                'UPDATE events SET registered_count = registered_count + $1 WHERE id = $2',
                [ticket_count, event_id]
            );

            return res.json({ 
                mock: true,
                url: `${process.env.FRONTEND_URL}/dashboard?payment=success&event=${event_id}`, 
                sessionId: mockSessionId 
            });
        }

        // Create Real Razorpay Order
        const options = {
            amount: amountInPaise,
            currency: 'INR', // Using INR as standard for Razorpay/UPI
            receipt: `receipt_ev_${event_id}_usr_${req.user.id}`,
            notes: {
                event_id: event_id,
                user_id: req.user.id,
                ticket_count: ticket_count.toString(),
            }
        };

        const order = await razorpay.orders.create(options);

        // Create pending registration using order_id
        await pool.query(
            `INSERT INTO registrations (user_id, event_id, ticket_count, total_paid, payment_status, stripe_session_id)
       VALUES ($1,$2,$3,$4,'pending',$5)
       ON CONFLICT (user_id, event_id) DO UPDATE SET stripe_session_id=$5, payment_status='pending'`,
            [req.user.id, event_id, ticket_count, event.price * ticket_count, order.id]
        );

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID,
            event_name: event.title,
            event_desc: event.short_description || `Tickets for ${event.title}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Payment order creation failed' });
    }
});

// POST /api/payments/verify-payment – Razorpay Verification
router.post('/verify-payment', authMiddleware, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, event_id, ticket_count } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing Razorpay properties' });
    }

    try {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Verification successful
            await pool.query(
                `UPDATE registrations SET payment_status='completed', total_paid=$1
                 WHERE stripe_session_id=$2`,
                [req.body.amount / 100 || 0, razorpay_order_id]
            );
            
            await pool.query(
                'UPDATE events SET registered_count = registered_count + $1 WHERE id = $2',
                [parseInt(ticket_count), event_id]
            );

            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error('Verify Event Payment DB Error:', err);
        return res.status(500).json({ success: false, message: 'Verification processing failed' });
    }
});

module.exports = router;

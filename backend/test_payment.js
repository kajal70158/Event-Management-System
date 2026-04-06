const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:5432/eventdb' });

async function test() {
    try {
        const evResult = await pool.query('SELECT * FROM events LIMIT 1');
        const event = evResult.rows[0];
        console.log("Event price:", event.price, typeof event.price);

        const ticket_count = 1;
        const mockSessionId = 'mock_session_' + Date.now();
        const total = event.price * ticket_count;
        console.log("Total:", total, typeof total);

        // find admin user
        const uRes = await pool.query('SELECT * FROM users LIMIT 1');
        const user = uRes.rows[0];
        
        await pool.query(
            `INSERT INTO registrations (user_id, event_id, ticket_count, total_paid, payment_status, stripe_session_id)
       VALUES ($1,$2,$3,$4,'completed',$5)
       ON CONFLICT (user_id, event_id) DO UPDATE SET stripe_session_id=$5, payment_status='completed', total_paid=$4`,
            [user.id, event.id, ticket_count, total, mockSessionId]
        );
        console.log("Success!");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
test();

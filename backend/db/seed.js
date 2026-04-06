const pool = require('./pool');

async function seedEvents() {
    // Get admin user or create one
    let adminResult = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    let adminId;

    if (adminResult.rows.length === 0) {
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('admin123', 12);
        const r = await pool.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@eventpro.com', $1, 'admin') RETURNING id",
            [hash]
        );
        adminId = r.rows[0].id;
        console.log('✅ Admin created: admin@eventpro.com / admin123');
    } else {
        adminId = adminResult.rows[0].id;
    }

    // Get categories
    const cats = await pool.query('SELECT id, name FROM categories');
    const catMap = {};
    cats.rows.forEach(c => { catMap[c.name] = c.id; });

    const existingCount = await pool.query('SELECT COUNT(*) FROM events');
    if (parseInt(existingCount.rows[0].count) > 0) {
        console.log('ℹ️  Events already seeded, skipping...');
        return;
    }

    const events = [
        {
            title: 'Web Summit 2026',
            short_description: 'The world\'s largest tech conference bringing together 70,000+ attendees.',
            description: 'Join the world\'s largest technology conference featuring 1,000+ speakers, 300+ startups, and unparalleled networking opportunities. From AI breakthroughs to the future of the web, Web Summit covers every angle of the tech industry.',
            category: 'Conference',
            location: 'Lisbon, Portugal',
            venue: 'Altice Arena',
            image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
            start_date: '2026-05-10T09:00:00Z',
            end_date: '2026-05-13T18:00:00Z',
            capacity: 5000,
            price: 299.00,
            is_featured: true,
        },
        {
            title: 'Global Music Festival 2026',
            short_description: '3-day outdoor music extravaganza with 50+ artists across 6 stages.',
            description: 'Experience three legendary days of non-stop music across six spectacular stages. Featuring headliners and emerging artists from around the globe, this festival is a celebration of every genre from indie rock to electronic dance music.',
            category: 'Music',
            location: 'Austin, Texas, USA',
            venue: 'Zilker Park',
            image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
            start_date: '2026-06-20T14:00:00Z',
            end_date: '2026-06-22T23:00:00Z',
            capacity: 20000,
            price: 149.00,
            is_featured: true,
        },
        {
            title: 'React & Node.js Workshop',
            short_description: 'Hands-on full-stack development workshop for intermediate developers.',
            description: 'Deep-dive into building production-ready full-stack applications using React 18, Node.js, and PostgreSQL. Bring your laptop and leave with a complete deployed project.',
            category: 'Workshop',
            location: 'San Francisco, CA, USA',
            venue: 'Moscone Center',
            image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
            start_date: '2026-04-15T10:00:00Z',
            end_date: '2026-04-15T18:00:00Z',
            capacity: 80,
            price: 79.00,
            is_featured: false,
        },
        {
            title: 'AI & Machine Learning Summit',
            short_description: 'Explore the cutting edge of artificial intelligence and ML applications.',
            description: 'A premier gathering of AI researchers, engineers, and business leaders exploring the latest advances in machine learning, large language models, computer vision, and AI ethics.',
            category: 'Technology',
            location: 'New York, NY, USA',
            venue: 'Jacob K. Javits Center',
            image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
            start_date: '2026-07-08T09:00:00Z',
            end_date: '2026-07-10T17:00:00Z',
            capacity: 2000,
            price: 199.00,
            is_featured: true,
        },
        {
            title: 'City Marathon 2026',
            short_description: 'Annual city marathon — 5K, 10K, half and full marathon categories.',
            description: 'Lace up and join thousands of runners in the most iconic city marathon of the year. Categories for all fitness levels, from first-timers to seasoned athletes. Medals, refreshments, and post-race celebrations included.',
            category: 'Sports',
            location: 'Chicago, IL, USA',
            venue: 'Grant Park Start Line',
            image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
            start_date: '2026-09-13T07:00:00Z',
            end_date: '2026-09-13T15:00:00Z',
            capacity: 10000,
            price: 55.00,
            is_featured: false,
        },
        {
            title: 'Street Food & Craft Beer Festival',
            short_description: 'Celebrate local culinary culture with 60+ food stalls and craft breweries.',
            description: 'A weekend-long celebration of food, drink, and community. Sample dishes from 60+ local chefs and artisan food vendors, paired with unique craft beers, wines, and cocktails from independent producers.',
            category: 'Food & Drink',
            location: 'Portland, OR, USA',
            venue: 'Tom McCall Waterfront Park',
            image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
            start_date: '2026-08-22T11:00:00Z',
            end_date: '2026-08-23T21:00:00Z',
            capacity: 3000,
            price: 25.00,
            is_featured: false,
        },
        {
            title: 'Modern Art Exhibition: Visions 2026',
            short_description: 'A stunning showcase of emerging artists redefining contemporary art.',
            description: 'Visions 2026 brings together 40+ emerging contemporary artists from over 20 countries. Explore paintings, sculptures, digital art, and immersive installations that challenge your perception.',
            category: 'Art & Culture',
            location: 'London, UK',
            venue: 'Tate Modern',
            image_url: 'https://images.unsplash.com/photo-1531913764164-f85c13636f5f?w=800&q=80',
            start_date: '2026-03-05T10:00:00Z',
            end_date: '2026-03-28T19:00:00Z',
            capacity: 500,
            price: 0,
            is_featured: false,
        },
        {
            title: 'Startup Founders Networking Night',
            short_description: 'Connect with 200+ founders, investors, and startup ecosystem leaders.',
            description: 'An intimate but high-energy evening designed for startup founders, early-stage investors, and tech ecosystem builders. Speed networking, fireside chats, and hosted introductions to accelerate your connections.',
            category: 'Networking',
            location: 'Berlin, Germany',
            venue: 'Factory Berlin',
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
            start_date: '2026-04-28T18:00:00Z',
            end_date: '2026-04-28T22:00:00Z',
            capacity: 200,
            price: 0,
            is_featured: false,
        },
    ];

    for (const ev of events) {
        await pool.query(
            `INSERT INTO events (title, short_description, description, category_id, location, venue, image_url,
        start_date, end_date, capacity, price, is_featured, organizer_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'published')`,
            [ev.title, ev.short_description, ev.description, catMap[ev.category] || null,
            ev.location, ev.venue, ev.image_url, ev.start_date, ev.end_date,
            ev.capacity, ev.price, ev.is_featured, adminId]
        );
    }
    console.log(`✅ Seeded ${events.length} demo events`);
}

module.exports = { seedEvents };

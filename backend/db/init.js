const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function initDB() {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    // Split on semicolons but keep UUID extension and table creation separate
    const statements = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('\\c') && !s.startsWith('CREATE DATABASE'));

    const client = await pool.connect();
    try {
        for (const stmt of statements) {
            try {
                await client.query(stmt);
            } catch (e) {
                // Ignore "already exists" type errors during init
                if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
                    console.error('DB init error on:', stmt.slice(0, 80));
                    console.error(e.message);
                }
            }
        }
        console.log('✅ Database initialized');
    } finally {
        client.release();
    }
}

module.exports = { initDB };

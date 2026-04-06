-- Event Organization System – PostgreSQL Schema

CREATE DATABASE IF NOT EXISTS eventdb;

\c eventdb;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(20)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  location VARCHAR(255),
  venue VARCHAR(255),
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT FALSE,
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft','published','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_count INT NOT NULL DEFAULT 1,
  total_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending','completed','refunded','free')),
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Seed Categories
INSERT INTO categories (name, icon, color) VALUES
  ('Conference', 'briefcase', '#6366f1'),
  ('Music', 'music', '#ec4899'),
  ('Sports', 'trophy', '#f59e0b'),
  ('Technology', 'cpu', '#10b981'),
  ('Art & Culture', 'palette', '#8b5cf6'),
  ('Food & Drink', 'utensils', '#ef4444'),
  ('Networking', 'users', '#0ea5e9'),
  ('Workshop', 'tool', '#f97316')
ON CONFLICT (name) DO NOTHING;

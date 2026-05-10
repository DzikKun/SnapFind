-- SnapFind Database Schema
-- MySQL Database for Face Recognition Photo Search App

CREATE DATABASE IF NOT EXISTS snapfind;
USE snapfind;

-- Users table (for authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'photographer', 'admin') NOT NULL DEFAULT 'user',
    email VARCHAR(100),
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    price DECIMAL(10,2) NOT NULL DEFAULT 15000,
    status ENUM('processing', 'active', 'completed', 'cancelled') DEFAULT 'processing',
    photographer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (photographer_id) REFERENCES users(id)
);

-- Photos table
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    photo_id VARCHAR(50) UNIQUE NOT NULL,
    event_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 15000,
    watermark BOOLEAN DEFAULT TRUE,
    face_embeddings JSON, -- Store face embeddings as JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    photo_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_id) REFERENCES photos(id)
);

-- Search history table
CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    search_query JSON, -- Store search parameters
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Insert default users
INSERT INTO users (username, password_hash, role, email, full_name) VALUES
('user', '$2b$10$dummy.hash.for.demo', 'user', 'user@snapfind.com', 'Demo User'),
('photographer', '$2b$10$dummy.hash.for.demo', 'photographer', 'photographer@snapfind.com', 'Demo Photographer'),
('admin', '$2b$10$dummy.hash.for.demo', 'admin', 'admin@snapfind.com', 'Demo Admin');

-- Insert sample events
INSERT INTO events (event_id, name, date, location, price, status) VALUES
('event-123', 'Wisuda Universitas 2025', '2025-03-21', 'Jakarta', 15000, 'active'),
('event-456', 'Wedding Sarah & John', '2025-03-15', 'Bali', 15000, 'active'),
('event-789', 'Music Festival 2025', '2025-03-10', 'Bandung', 15000, 'processing');

-- Insert sample photos with dummy embeddings
INSERT INTO photos (photo_id, event_id, url, price, watermark, face_embeddings) VALUES
('1', 1, 'https://images.unsplash.com/photo-1757143137392-0b1e1a27a7de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.1, 0.2, 0.3, 0.4, 0.5]'),
('2', 1, 'https://images.unsplash.com/photo-1764269719300-7094d6c00533?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.2, 0.3, 0.4, 0.5, 0.6]'),
('3', 1, 'https://images.unsplash.com/photo-1577648884063-1d3d1477b8a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.3, 0.4, 0.5, 0.6, 0.7]'),
('4', 1, 'https://images.unsplash.com/photo-1763951778440-13af353b122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.4, 0.5, 0.6, 0.7, 0.8]'),
('5', 1, 'https://images.unsplash.com/photo-1763739527636-d3d8cac52d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.5, 0.6, 0.7, 0.8, 0.9]'),
('6', 1, 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', 15000, TRUE, '[0.6, 0.7, 0.8, 0.9, 1.0]');
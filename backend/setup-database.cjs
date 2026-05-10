const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;

  try {
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);

    console.log('✅ Connected to MySQL');

    // Create database if it doesn't exist
    console.log('🔄 Creating database snapfind...');
    await connection.query('CREATE DATABASE IF NOT EXISTS snapfind');
    console.log('✅ Database snapfind created');

    // Switch to snapfind database
    await connection.query('USE snapfind');

    // Read and execute schema (skip CREATE DATABASE and USE statements)
    const schemaPath = path.join(__dirname, 'database', 'snapfind_schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('🔄 Executing schema...');
      let schema = fs.readFileSync(schemaPath, 'utf8');

      // Remove CREATE DATABASE and USE statements
      schema = schema.replace(/CREATE DATABASE IF NOT EXISTS snapfind;\s*/i, '');
      schema = schema.replace(/USE snapfind;\s*/i, '');

      // Split into individual statements and execute
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement.trim() + ';');
        }
      }

      console.log('✅ Schema executed successfully');
    } else {
      console.error('❌ Schema file not found:', schemaPath);
      return;
    }

    // Insert sample data
    console.log('🔄 Inserting sample data...');

    // Insert sample events
    const events = [
      {
        event_id: 'event-123',
        name: 'Wisuda Universitas 2025',
        date: '2025-03-21',
        location: 'Jakarta',
        price: 15000,
        status: 'active'
      },
      {
        event_id: 'event-456',
        name: 'Wedding Sarah & John',
        date: '2025-03-15',
        location: 'Bali',
        price: 15000,
        status: 'active'
      },
      {
        event_id: 'event-789',
        name: 'Music Festival 2025',
        date: '2025-03-10',
        location: 'Bandung',
        price: 15000,
        status: 'processing'
      }
    ];

    for (const event of events) {
      await connection.execute(`
        INSERT INTO events (event_id, name, date, location, price, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        date = VALUES(date),
        location = VALUES(location),
        price = VALUES(price),
        status = VALUES(status)
      `, [event.event_id, event.name, event.date, event.location, event.price, event.status]);
    }

    // Insert sample photos for event-123
    const photos = [
      {
        photo_id: '1',
        url: 'https://images.unsplash.com/photo-1757143137392-0b1e1a27a7de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      },
      {
        photo_id: '2',
        url: 'https://images.unsplash.com/photo-1764269719300-7094d6c00533?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      },
      {
        photo_id: '3',
        url: 'https://images.unsplash.com/photo-1577648884063-1d3d1477b8a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      },
      {
        photo_id: '4',
        url: 'https://images.unsplash.com/photo-1763951778440-13af353b122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      },
      {
        photo_id: '5',
        url: 'https://images.unsplash.com/photo-1763739527636-d3d8cac52d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      },
      {
        photo_id: '6',
        url: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
        price: 15000,
        watermark: true
      }
    ];

    for (const photo of photos) {
      await connection.execute(`
        INSERT INTO photos (photo_id, event_id, url, price, watermark)
        SELECT ?, e.id, ?, ?, ?
        FROM events e
        WHERE e.event_id = 'event-123'
        ON DUPLICATE KEY UPDATE
        url = VALUES(url),
        price = VALUES(price),
        watermark = VALUES(watermark)
      `, [photo.photo_id, photo.url, photo.price, photo.watermark]);
    }

    console.log('✅ Sample data inserted successfully');
    console.log('🎉 Database setup completed!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
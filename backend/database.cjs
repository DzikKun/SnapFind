'use strict';

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// REVISI: Pastikan fungsi ini bisa dipanggil di server.cjs
function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial = { events: [], photos: [], transactions: [], withdrawals: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { events: [], photos: [], transactions: [], withdrawals: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

async function testConnection() {
  try {
    readDb();
    console.log('✅ JSON Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function getEvents() {
  try {
    const db = readDb();
    return db.events.map(event => ({
      ...event,
      foundCount: db.photos.filter(p => p.eventId === event.eventId).length,
      matchScore: 0,
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

async function getEventById(eventId) {
  try {
    const db = readDb();
    const event = db.events.find(e => e.eventId === eventId);
    if (!event) return null;

    const photos = db.photos.filter(p => p.eventId === eventId);
    return {
      ...event,
      foundCount: photos.length,
      photos: photos.map(p => ({
        id: p.id,
        url: p.url,
        price: p.price,
        watermark: p.watermark,
      })),
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

async function createEvent(eventData) {
  try {
    const db = readDb();
    const eventId = `event-${Date.now()}`;
    const newEvent = {
      eventId,
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      price: eventData.price || 15000,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.events.unshift(newEvent);
    writeDb(db);
    return { ...newEvent, foundCount: 0, matchScore: 0, photos: [] };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

async function addPhotoToEvent(eventId, photoData) {
  try {
    const db = readDb();
    const photo = {
      id: photoData.id,
      eventId,
      url: photoData.url,
      price: photoData.price,
      watermark: photoData.watermark,
      createdAt: new Date().toISOString(),
    };
    db.photos.push(photo);
    writeDb(db);
    return photo.id;
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
}

// REVISI: searchFaces versi JavaScript lama kita nonaktifkan 
// karena sekarang proses dilakukan oleh match_engine.py (Python)
async function searchFaces(faceDescriptor, eventId) {
  console.warn("Fungsi searchFaces JS lama dipanggil. Seharusnya menggunakan Python Engine.");
  return { matches: [] };
}

async function authenticateUser(username, password) {
  try {
    const demoUsers = {
      'user':         { role: 'user',         password: 'user123' },
      'photographer': { role: 'photographer', password: 'photo123' },
      'admin':        { role: 'admin',        password: 'admin123' },
    };
    if (demoUsers[username] && demoUsers[username].password === password) {
      return { success: true, role: demoUsers[username].role, username };
    }
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

// REVISI: Pastikan readDb di-export agar server.cjs bisa mengambil daftar foto
module.exports = {
  readDb,
  testConnection,
  getEvents,
  getEventById,
  createEvent,
  addPhotoToEvent,
  searchFaces,
  authenticateUser,
};
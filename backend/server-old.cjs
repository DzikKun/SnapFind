'use strict';

const http = require('http');
const url = require('url');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb');

// Initialize database
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// Default data
const defaultData = {
  events: {
    'event-123': {
      eventId: 'event-123',
      name: 'Wisuda Universitas 2025',
      date: '2025-03-21',
      location: 'Jakarta',
      price: 15000,
      status: 'active',
      matchScore: 95,
      foundCount: 6,
      photos: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1757143137392-0b1e1a27a7de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1764269719300-7094d6c00533?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1577648884063-1d3d1477b8a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1763951778440-13af353b122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1763739527636-d3d8cac52d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
          price: 15000,
          watermark: true,
          purchased: false,
        },
      ],
    },
    'event-456': {
      eventId: 'event-456',
      name: 'Wedding Sarah & John',
      date: '2025-03-15',
      location: 'Bali',
      price: 15000,
      status: 'active',
      matchScore: 85,
      foundCount: 842,
      photos: [],
    },
    'event-789': {
      eventId: 'event-789',
      name: 'Music Festival 2025',
      date: '2025-03-10',
      location: 'Bandung',
      price: 15000,
      status: 'processing',
      matchScore: 0,
      foundCount: 1158,
      photos: [],
    },
  },
};

// Read data from file or set defaults
db.read().then(() => {
  if (!db.data) {
    db.data = defaultData;
    db.write();
  }
});

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (method === 'GET' && path === '/api/events') {
    const eventList = Object.values(db.data.events).map(event => ({
      eventId: event.eventId,
      name: event.name,
      date: event.date,
      location: event.location,
      price: event.price,
      status: event.status,
      foundCount: event.foundCount,
      matchScore: event.matchScore,
    }));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(eventList));
  }

  if (method === 'POST' && path === '/api/events') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const eventData = JSON.parse(body);
        const eventId = `event-${Date.now()}`;

        const newEvent = {
          eventId,
          name: eventData.name,
          date: eventData.date,
          location: eventData.location,
          price: parseInt(eventData.price) || 15000,
          status: 'processing',
          matchScore: 0,
          foundCount: 0,
          photos: [],
        };

        events[eventId] = newEvent;
        db.write();

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newEvent));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({error: 'Invalid JSON data'}));
      }
    });

    return;
  }

  if (method === 'GET' && path.startsWith('/api/events/') && path.endsWith('/photos')) {
    const eventId = path.split('/')[3];
    const event = db.data.events[eventId];

    if (!event) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({error: 'Event not found'}));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({...event}));
  }

  if (method === 'POST' && path.startsWith('/api/events/') && path.endsWith('/photos')) {
    const eventId = path.split('/')[3];
    const event = db.data.events[eventId];

    if (!event) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({error: 'Event not found'}));
    }

    // Simulasi upload foto; tidak parsing Binary FormData untuk mock server
    const samplePhotos = [
      'https://images.unsplash.com/photo-1687153798948-36b9d8e4b7c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1661956609074-2e3b391db46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1677487636974-7f9acdaab45f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
      'https://images.unsplash.com/photo-1678666196180-199467e6bb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    ];
    const newPhoto = {
      id: `${Date.now()}`,
      url: samplePhotos[Math.floor(Math.random() * samplePhotos.length)],
      price: event.price,
      watermark: true,
      purchased: false,
    };

    event.photos.push(newPhoto);
    event.foundCount = event.photos.length;
    event.matchScore = Math.min(100, event.matchScore + 1);

    db.write();

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({message: 'Photo uploaded', photo: newPhoto, event}));
  }

  if (method === 'POST' && path === '/api/login') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);

        // Mock authentication
        let role = null;
        if (username === 'user' && password === 'user123') {
          role = 'user';
        } else if (username === 'photographer' && password === 'photo123') {
          role = 'photographer';
        } else if (username === 'admin' && password === 'admin123') {
          role = 'admin';
        }

        if (role) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, role, username }));
        } else {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON data' }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({error: 'Route not found'}));
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Backend mock server running at http://localhost:${PORT}`);
});

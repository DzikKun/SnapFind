'use strict';

const { spawn } = require('child_process');
const http = require('http');
const url = require('url');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
    readDb,
    testConnection,
    getEvents,
    getEventById,
    createEvent,
    deleteEvent,
    addPhotoToEvent,
    authenticateUser
} = require('./database.cjs');

const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'python' : 'python3');

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:4000',
];

const setCorsHeaders = (req, res) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    // Do NOT set wildcard '*' with credentials — browsers reject this combination
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

let faceApiLoaded = false;
const realtimeClients = new Set();

const sendWebSocketMessage = (socket, payload) => {
    if (socket.destroyed) return;

    const data = Buffer.from(JSON.stringify(payload));
    let header;

    if (data.length < 126) {
        header = Buffer.from([0x81, data.length]);
    } else if (data.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(data.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(data.length), 2);
    }

    socket.write(Buffer.concat([header, data]));
};

const broadcastRealtimeEvent = (payload) => {
    for (const client of realtimeClients) {
        sendWebSocketMessage(client, payload);
    }
};

const loadFaceApi = async() => {
    console.log('✅ Backend siap menerima face descriptor dari frontend');
    faceApiLoaded = true;
};

(async() => {
    await testConnection();
    await loadFaceApi();
})();

const server = http.createServer(async(req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:4000'}`);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    setCorsHeaders(req, res);

    if (method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    if (method === 'GET' && pathname.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, pathname);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif'
            }[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            const stream = fs.createReadStream(filePath);
            stream.pipe(res);
            return;
        } else {
            res.statusCode = 404;
            res.end('File not found');
            return;
        }
    }

    if (method === 'GET' && pathname === '/api/events') {
        try {
            const events = await getEvents();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(events));
        } catch (error) {
            console.error('Error fetching events:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Failed to fetch events' }));
        }
    }

    if (method === 'POST' && pathname === '/api/events') {
        let body = '';
        let bodySize = 0;
        req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > 10240) { // 10KB limit
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Request body too large' }));
                req.destroy();
                return;
            }
            body += chunk;
        });
        req.on('end', async() => {
            try {
                const eventData = JSON.parse(body);
                const newEvent = await createEvent(eventData);
                broadcastRealtimeEvent({
                    type: 'event:created',
                    event: newEvent,
                    message: `Event "${newEvent.name}" dibuat`,
                });
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newEvent));
            } catch (error) {
                console.error('Error creating event:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Failed to create event' }));
            }
        });
        return;
    }

    if (method === 'DELETE' && pathname.startsWith('/api/events/') && !pathname.endsWith('/photos')) {
        const eventId = pathname.split('/')[3];
        try {
            const result = await deleteEvent(eventId);
            res.setHeader('Content-Type', 'application/json');
            if (!result) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Event not found' }));
            }
            broadcastRealtimeEvent({
                type: 'event:deleted',
                eventId,
                eventName: result.event?.name,
                deletedPhotos: result.deletedPhotos || 0,
                message: `Event "${result.event?.name || eventId}" dihapus`,
            });
            res.statusCode = 200;
            return res.end(JSON.stringify({ message: 'Event deleted successfully', ...result }));
        } catch (error) {
            console.error('Error deleting event:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Failed to delete event' }));
        }
    }

    if (method === 'GET' && pathname.startsWith('/api/events/') && pathname.endsWith('/photos')) {
        const eventId = pathname.split('/')[3];
        try {
            const event = await getEventById(eventId);
            if (!event) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Event not found' }));
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(event));
        } catch (error) {
            console.error('Error fetching event:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Failed to fetch event' }));
        }
    }

    if (method === 'POST' && pathname.startsWith('/api/events/') && pathname.endsWith('/photos')) {
        const eventId = pathname.split('/')[3];
        upload.single('file')(req, res, async(err) => {
            if (err) {
                console.error('Upload error:', err);
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'File upload failed' }));
            }
            try {
                if (!req.file) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ error: 'No file uploaded' }));
                }

                const faceEmbeddings = [];
                const photoData = {
                    id: `${Date.now()}`,
                    url: `http://localhost:4000/uploads/${req.file.filename}`,
                    price: 15000,
                    watermark: true,
                    faceEmbeddings,
                };
                await addPhotoToEvent(eventId, photoData);
                const event = await getEventById(eventId);
                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Photo uploaded successfully', photo: photoData, event }));
            } catch (error) {
                console.error('Error processing uploaded photo:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Failed to process photo' }));
            }
        });
        return;
    }

    if (method === 'POST' && pathname === '/api/login') {
        let body = '';
        let bodySize = 0;
        req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > 2048) { // 2KB limit for login
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Request body too large' }));
                req.destroy();
                return;
            }
            body += chunk;
        });
        req.on('end', async() => {
            try {
                const { username, password } = JSON.parse(body);
                const authResult = await authenticateUser(username, password);
                if (authResult.success) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(authResult));
                } else {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: authResult.error || 'Invalid credentials' }));
                }
            } catch (error) {
                console.error('Login error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Login failed' }));
            }
        });
        return;
    }

    if (method === 'POST' && pathname === '/api/search') {
        upload.single('file')(req, res, async(err) => {
            if (err) {
                console.error('Multer Error:', err);
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Upload failed' }));
            }

            try {
                // PERBAIKAN: Mencegah error "Cannot read properties of undefined"
                const body = req.body || {};
                const eventId = body.eventId;

                console.log("--- DEBUG SEARCH ---");
                console.log("Body terdeteksi:", body);
                console.log("Event ID received:", eventId);
                console.log("File received:", req.file ? req.file.filename : "TIDAK ADA");

                if (!req.file || !eventId) {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({
                        error: 'Selfie and Event ID are required',
                        received: { eventId: eventId || "null", file: !!req.file }
                    }));
                }

                const userSelfiePath = req.file.path;
                const db = readDb();
                const eventPhotos = db.photos.filter(p => p.eventId === eventId);

                console.log(`🔎 Membandingkan dengan ${eventPhotos.length} foto...`);

                const matches = [];

                for (const photo of eventPhotos) {
                    const fileName = path.basename(photo.url);
                    const dbPhotoPath = path.join(__dirname, 'uploads', fileName);

                    if (!fs.existsSync(dbPhotoPath)) continue;

                    // Panggil Python untuk mencocokkan wajah
                    const result = await new Promise((resolve) => {
                        const python = spawn(PYTHON_EXECUTABLE, ['match_engine.py', userSelfiePath, dbPhotoPath], {
                            cwd: __dirname
                        });
                        let dataString = '';
                        let stderrString = '';
                        python.stdout.on('data', (data) => { dataString += data.toString(); });
                        python.stderr.on('data', (data) => { stderrString += data.toString(); });
                        python.on('error', (error) => {
                            console.error('Python spawn error:', error);
                            resolve({ similarity: 0 });
                        });
                        python.on('close', (code) => {
                            if (stderrString) console.warn('Python stderr:', stderrString.substring(0, 200));
                            try {
                                const parsed = JSON.parse(dataString);
                                // Python returns an array of results or an error object
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    resolve(parsed[0]); // Take the first (and only) match result
                                } else if (parsed && parsed.error) {
                                    console.warn('Python error:', parsed.error);
                                    resolve({ similarity: 0 });
                                } else {
                                    resolve({ similarity: 0 });
                                }
                            } catch (e) {
                                console.warn('Failed to parse Python output:', dataString.substring(0, 200));
                                resolve({ similarity: 0 });
                            }
                        });
                    });

                    if (result.similarity > 40) {
                        matches.push({ photoId: photo.id, similarity: result.similarity, url: photo.url });
                    }
                }

                if (fs.existsSync(userSelfiePath)) fs.unlinkSync(userSelfiePath);

                matches.sort((a, b) => b.similarity - a.similarity);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ matchedFaces: matches.length, matches: matches.slice(0, 12) }));

            } catch (error) {
                console.error('Search Engine Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
        return;
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Route not found' }));
});

const PORT = 4000;

server.on('upgrade', (req, socket) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:4000'}`);
    if (parsedUrl.pathname !== '/ws') {
        socket.destroy();
        return;
    }

    const websocketKey = req.headers['sec-websocket-key'];
    if (!websocketKey) {
        socket.destroy();
        return;
    }

    const acceptKey = crypto
        .createHash('sha1')
        .update(`${websocketKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest('base64');

    socket.write([
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        '',
        '',
    ].join('\r\n'));

    realtimeClients.add(socket);
    sendWebSocketMessage(socket, { type: 'connection:ready' });

    socket.on('data', (buffer) => {
        const opcode = buffer[0] & 0x0f;
        if (opcode === 0x8) {
            realtimeClients.delete(socket);
            socket.end();
        }
    });
    socket.on('close', () => realtimeClients.delete(socket));
    socket.on('error', () => realtimeClients.delete(socket));
});

server.listen(PORT, () => {
    console.log(`✅ Backend server running at http://localhost:${PORT}`);
    console.log(`📦 Connected to JSON database`);
});

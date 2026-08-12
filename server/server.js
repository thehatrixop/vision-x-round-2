/**
 * Smart Classroom WebSocket & REST Server
 * Ports: 5000 (HTTP REST & WebSocket Gateway)
 * 
 * Facilitates real-time communication between the Teacher App (friend's app)
 * and the Student Web App. Broadcasts vector drawing strokes and translated captions.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

let WebSocketServer;
try {
  WebSocketServer = require('ws').Server;
} catch (e) {
  console.log("Optional 'ws' module not found. Server running HTTP endpoints mode.");
}

const PORT = process.env.PORT || 5000;
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// In-Memory Lecture Sessions Store
let sessions = [
  {
    id: "cs101-recursion",
    title: "CS101: Recursion & Binary Search Trees",
    instructor: "Prof. A. Sharma",
    course: "Computer Science 101",
    date: "Today (Live Session)",
    isLive: true,
    durationSeconds: 45,
    technicalTerms: ["recursion", "base case", "call stack", "binary search tree", "root node", "leaf node"],
    segments: []
  }
];

// Connected WebSocket Clients List
const connectedStudents = new Set();
const connectedTeachers = new Set();

// Create HTTP REST Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint: GET /api/sessions
  if (req.method === 'GET' && url.pathname === '/api/sessions') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions }));
    return;
  }

  // Endpoint: GET /api/sessions/:id
  if (req.method === 'GET' && url.pathname.startsWith('/api/sessions/')) {
    const id = url.pathname.split('/')[3];
    const session = sessions.find(s => s.id === id);
    if (session) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', session }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: 'Session not found' }));
    }
    return;
  }

  // Endpoint: POST /api/teacher/stroke (Friend's Teacher App sends drawing stroke events)
  if (req.method === 'POST' && url.pathname === '/api/teacher/stroke') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        broadcastToStudents({ type: 'stroke_event', stroke: data });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Stroke broadcasted' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Endpoint: POST /api/teacher/caption (Friend's Teacher App sends translated caption segments)
  if (req.method === 'POST' && url.pathname === '/api/teacher/caption') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        broadcastToStudents({ type: 'caption_event', segment: data });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Caption broadcasted' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'error', message: 'Endpoint not found' }));
});

// Broadcast payload to all connected Student Web Apps
function broadcastToStudents(payload) {
  const jsonStr = JSON.stringify(payload);
  connectedStudents.forEach(ws => {
    if (ws.readyState === 1) { // OPEN
      ws.send(jsonStr);
    }
  });
}

// Initialize WebSocket Server if 'ws' module available
if (WebSocketServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.replace('/?', ''));
    const role = urlParams.get('role') || 'student';

    if (role === 'teacher') {
      connectedTeachers.add(ws);
      console.log(`Teacher App connected. Total Teachers: ${connectedTeachers.size}`);
    } else {
      connectedStudents.add(ws);
      console.log(`Student Web App connected. Total Students: ${connectedStudents.size}`);
    }

    // Send connection acknowledgement
    ws.send(JSON.stringify({
      type: 'connection_ack',
      role: role,
      status: 'connected',
      activeSessions: sessions
    }));

    ws.on('message', (message) => {
      try {
        const rawStr = message.toString();
        const data = JSON.parse(rawStr);
        console.log("Received WebSocket event:", data.type || "stroke/caption payload");

        // Broadcast drawing/stroke/caption data to all connected clients except sender
        if (data.stroke || data.segment || data.type === 'stroke_event' || data.type === 'caption_event' || data.points || data.role === 'teacher' || role === 'teacher') {
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) { // 1 = OPEN
              client.send(rawStr);
            }
          });
        }
      } catch (e) {
        console.error("Malformed message received:", e.message);
      }
    });

    ws.on('close', () => {
      connectedStudents.delete(ws);
      connectedTeachers.delete(ws);
      console.log("Client disconnected.");
    });
  });
}

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 Smart Classroom Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket Gateway: ws://localhost:${PORT}`);
  console.log(`🔗 REST API Base URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

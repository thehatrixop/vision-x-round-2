# Smart Classroom Server Integration Guide

This guide explains how to connect your friend's **Teacher App** to the **Student Web App** via this Node.js WebSocket & REST backend.

---

## 🚀 1. How to Run the Backend Server

Open your terminal in `d:\prograamming\bobhacks\server\` and run:

```bash
npm install
npm start
```
Or without npm:
```bash
node server.js
```

The server runs on **Port 5000**:
- **REST API Base URL**: `http://localhost:5000/api`
- **WebSocket URL**: `ws://localhost:5000?role=teacher` (for Teacher App) or `ws://localhost:5000?role=student` (for Student App).

---

## 📡 2. Teacher App Integration Specs (for your friend)

Your friend's app can send drawing strokes and translated speech segments to the server using **WebSockets** or **HTTP POST requests**.

### Method A: Connect via WebSocket (Recommended for Real-Time Streaming)
Connect to: `ws://localhost:5000?role=teacher`

1. **Send Stroke Event** (as teacher draws on digital whiteboard):
```json
{
  "role": "teacher",
  "type": "stroke_event",
  "stroke": {
    "tool": "pen",
    "color": "#38bdf8",
    "size": 3,
    "points": [[250, 60], [270, 50], [290, 60], [290, 80]]
  }
}
```

2. **Send Caption Event** (when teacher finishes a spoken sentence):
```json
{
  "role": "teacher",
  "type": "caption_event",
  "segment": {
    "id": "seg-101",
    "startTime": 12.0,
    "endTime": 16.5,
    "englishText": "When we traverse down to a leaf node, each call pushes to the call stack.",
    "translations": {
      "hi": "जब हम एक leaf node तक नीचे जाते हैं, तो प्रत्येक कॉल call stack पर पुश करती है।",
      "bn": "আমরা যখন leaf node পর্যন্ত নিচে নেমে যাই, প্রতিটি কল call stack-এ পুশ করে।",
      "ar": "عندما ننتقل للأسفل إلى leaf node، تقوم كل استدعاء بالدفع إلى call stack."
    },
    "technicalTerms": ["leaf node", "call stack"]
  }
}
```

---

### Method B: Connect via HTTP POST (Simplest)
If your friend's app does not support WebSockets, send simple HTTP POST requests:

- **Send Stroke Coordinates**:
  `POST http://localhost:5000/api/teacher/stroke`
  Body (JSON):
  ```json
  {
    "tool": "pen",
    "color": "#38bdf8",
    "size": 3,
    "points": [[50, 40], [50, 90], [75, 40]]
  }
  ```

- **Send Translated Caption Segment**:
  `POST http://localhost:5000/api/teacher/caption`
  Body (JSON):
  ```json
  {
    "id": "seg-102",
    "startTime": 16.5,
    "endTime": 22.0,
    "englishText": "Notice how root node 10 splits left and right.",
    "translations": {
      "hi": "ध्यान दें कि root node 10 बाएं और दाएं में कैसे विभाजित होता है।"
    },
    "technicalTerms": ["root node"]
  }
  ```

---

## 🎓 3. Student Web App Receiver Integration
The Student Web App automatically connects to `ws://localhost:5000?role=student`.
When an event arrives, it updates the canvas and caption feed instantaneously!

/**
 * Test Teacher Client Script for Smart Classroom System
 * 
 * Simulates a Teacher App sending live 'stroke_batch' vector strokes,
 * incremental line segments, and 'transcript_segment' captions over WebSocket.
 * 
 * Usage:
 *   node server/test-client.js
 *   or:
 *   node server/test-client.js wss://smart-classroom-backend-iueo.onrender.com
 */

const WebSocket = require('ws');

const TARGET_URL = process.argv[2] || "ws://localhost:5000?role=teacher";
console.log(`Connecting Test Teacher Client to: ${TARGET_URL}...`);

const ws = new WebSocket(TARGET_URL);

ws.on('open', () => {
  console.log("✅ Test Teacher Client connected successfully!");

  // Step 1: Send a transcript_segment event
  console.log("📡 Emitting live transcript_segment...");
  ws.send(JSON.stringify({
    type: "transcript_segment",
    role: "teacher",
    id: "live-seg-" + Date.now(),
    startTime: 0,
    endTime: 10,
    englishText: "Welcome students! Today we are drawing a star graph and testing recursion call stacks.",
    text: "Welcome students! Today we are drawing a star graph and testing recursion call stacks.",
    translations: {
      hi: "छात्रों का स्वागत है! आज हम एक स्टार ग्राफ बना रहे हैं और recursion कॉल स्टैक का परीक्षण कर रहे हैं।",
      bn: "শিক্ষার্থীদের স্বাগতম! আজ আমরা একটি স্টার গ্রাফ আঁকছি এবং recursion কল স্ট্যাক পরীক্ষা করছি।",
      ar: "مرحباً بالطلاب! اليوم نحدد رسم نفي وتجربة استدعاء recursion."
    },
    technicalTerms: ["recursion", "call stack", "graph"]
  }));

  // Step 2: Send stroke_batch payload variations (Star Outer outline + Object points + Line segment)
  console.log("🎨 Emitting live stroke_batch drawing data...");

  const testPayloads = [
    // Payload Format 1: Standard stroke_batch with points array
    {
      type: "stroke_batch",
      role: "teacher",
      strokes: [
        { color: "#38bdf8", size: 4, points: [[400, 80], [450, 200], [580, 200], [470, 280], [510, 400], [400, 320], [290, 400], [330, 280], [220, 200], [350, 200], [400, 80]] }
      ]
    },
    // Payload Format 2: Object point pairs [{x, y}]
    {
      type: "stroke_batch",
      role: "teacher",
      batch: [
        { color: "#a855f7", size: 4, points: [{x: 380, y: 230}, {x: 420, y: 230}, {x: 420, y: 270}, {x: 380, y: 270}, {x: 380, y: 230}] }
      ]
    },
    // Payload Format 3: Incremental line segment {x1, y1, x2, y2}
    {
      type: "stroke_batch",
      role: "teacher",
      lines: [
        { color: "#34d399", size: 5, x1: 200, y1: 440, x2: 600, y2: 440 }
      ]
    }
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= testPayloads.length) {
      clearInterval(interval);
      console.log("✨ All test stroke_batch payloads emitted successfully!");
      setTimeout(() => ws.close(), 2000);
      return;
    }

    const currentPayload = testPayloads[index];
    console.log(`✏️ Sending payload variation ${index + 1}/${testPayloads.length}...`);
    
    ws.send(JSON.stringify(currentPayload));
    index++;
  }, 1000);
});

ws.on('error', (err) => {
  console.error("❌ Test Client Connection Error:", err.message);
});

ws.on('close', () => {
  console.log("🔌 Test Client Disconnected.");
});

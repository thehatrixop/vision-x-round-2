/**
 * Smart Classroom Student Web Application Core Logic
 * Handles progressive whiteboard vector rendering, multilingual caption sync,
 * preserved term formatting, Web Speech API TTS, interactive scrub playback,
 * and live WebSocket connection to the backend server.
 */

class SmartClassroomApp {
  constructor() {
    this.currentLecture = LECTURE_DATA[0];
    this.currentLanguage = "hi"; // Default language: Hindi
    this.currentTime = 0;
    this.isPlaying = true;
    this.isTTSOn = false;
    this.playbackSpeed = 1;
    this.activeSegmentId = null;
    this.timerInterval = null;
    this.ws = null;
    this.isBackendConnected = false;

    // DOM Elements
    this.canvas = document.getElementById("whiteboard-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.captionFeed = document.getElementById("caption-feed");
    this.timelineSlider = document.getElementById("timeline-slider");
    this.playBtn = document.getElementById("play-btn");
    this.currentTimeEl = document.getElementById("current-time");
    this.totalTimeEl = document.getElementById("total-time");
    this.langSelect = document.getElementById("lang-select");
    this.ttsBtn = document.getElementById("tts-btn");
    this.speedSelect = document.getElementById("speed-select");
    this.lectureTitleEl = document.getElementById("lecture-title");
    this.instructorEl = document.getElementById("instructor-name");
    this.liveBadge = document.getElementById("live-badge");
    this.sessionModal = document.getElementById("session-modal");
    this.sessionList = document.getElementById("session-list");
    this.openSessionsBtn = document.getElementById("open-sessions-btn");
    this.closeModalBtn = document.getElementById("close-modal-btn");
    this.simLiveBtn = document.getElementById("sim-live-btn");
    this.setUrlBtn = document.getElementById("set-url-btn");
    this.debugBtn = document.getElementById("debug-btn");
    this.closeDebugBtn = document.getElementById("close-debug-btn");
    this.debugModal = document.getElementById("debug-modal");
    this.debugLogContainer = document.getElementById("debug-log-container");
    this.debugUrlStatus = document.getElementById("debug-url-status");
    this.reconnectBanner = document.getElementById("reconnect-banner");

    this.init();
  }

  init() {
    this.setupCanvas();
    this.populateLanguageDropdown();
    this.populateSessionModal();
    this.attachEventListeners();
    this.loadLecture(this.currentLecture);
    this.startPlaybackLoop();
    this.connectWebSocket();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = (rect.width || 800) * dpr;
    this.canvas.height = (rect.height || 500) * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset scale matrix before applying dpr scale
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = rect.width || 800;
    this.canvasHeight = rect.height || 500;
  }

  getWebSocketUrl() {
    let targetUrl = localStorage.getItem("CUSTOM_BACKEND_WS_URL");

    // Default target backend on Render
    if (!targetUrl || targetUrl.trim() === "") {
      targetUrl = "wss://smart-classroom-backend-iueo.onrender.com";
    }

    targetUrl = targetUrl.trim();

    // Sanitize http:// -> ws:// and https:// -> wss://
    if (targetUrl.startsWith("http://")) {
      targetUrl = "ws://" + targetUrl.slice(7);
    } else if (targetUrl.startsWith("https://")) {
      targetUrl = "wss://" + targetUrl.slice(8);
    }

    if (!targetUrl.startsWith("ws://") && !targetUrl.startsWith("wss://")) {
      targetUrl = "wss://" + targetUrl;
    }

    if (!targetUrl.includes("?role=") && !targetUrl.includes("&role=")) {
      targetUrl += targetUrl.includes("?") ? "&role=student" : "?role=student";
    }

    return targetUrl;
  }

  connectWebSocket() {
    try {
      const wsUrl = this.getWebSocketUrl();
      console.log("Connecting to Backend WebSocket:", wsUrl);
      
      const cleanDisplayUrl = wsUrl.replace("wss://", "").replace("ws://", "").replace("?role=student", "");
      this.liveBadge.innerHTML = `<span class="pulse-dot"></span> CONNECTING...`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isBackendConnected = true;
        this.liveBadge.innerHTML = `<span class="pulse-dot"></span> LIVE: ${cleanDisplayUrl}`;
        this.liveBadge.className = "live-indicator";
        this.switchToLiveStream();
      };

      this.ws.onmessage = async (event) => {
        try {
          let textData = event.data;
          if (event.data instanceof Blob) {
            textData = await event.data.text();
          } else if (typeof ArrayBuffer !== 'undefined' && event.data instanceof ArrayBuffer) {
            textData = new TextDecoder().decode(event.data);
          }

          const data = typeof textData === 'string' ? JSON.parse(textData) : textData;
          this.logToDebugConsole("RECEIVED", data);
          
          try {
            this.handleIncomingWebSocketData(data);
          } catch (handlerErr) {
            console.error("Handler error:", handlerErr);
            this.logToDebugConsole("HANDLER_ERR", handlerErr.message);
          }
        } catch (e) {
          console.log("WebSocket JSON message parse error:", e);
          this.logToDebugConsole("PARSE_ERR", e.message);
        }
      };

      this.ws.onclose = () => {
        this.isBackendConnected = false;
        this.liveBadge.innerHTML = `⚠️ OFFLINE: Retrying...`;
        this.liveBadge.className = "live-indicator past";
        this.logToDebugConsole("STATUS", "WebSocket Disconnected. Retrying in 4s...");
        setTimeout(() => this.connectWebSocket(), 4000);
      };

      this.ws.onerror = (err) => {
        this.isBackendConnected = false;
        this.logToDebugConsole("ERROR", `WebSocket connection failed for URL: ${wsUrl}`);
      };
    } catch (err) {
      console.log("WebSocket connection skipped (Backend offline). Using demo dataset.");
    }
  }

  logToDebugConsole(tag, data) {
    if (!this.debugLogContainer) return;
    const timeStr = new Date().toLocaleTimeString();
    const content = typeof data === "object" ? JSON.stringify(data, null, 2) : data;
    
    const entry = document.createElement("div");
    entry.style.borderBottom = "1px dashed rgba(255,255,255,0.1)";
    entry.style.paddingBottom = "6px";
    entry.style.marginBottom = "6px";
    entry.innerHTML = `<span style="color: var(--primary-cyan)">[${timeStr}] [${tag}]</span> ${this.escapeHtml(content)}`;
    
    this.debugLogContainer.appendChild(entry);
    this.debugLogContainer.scrollTop = this.debugLogContainer.scrollHeight;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  handleIncomingWebSocketData(data) {
    if (!data) return;

    // Check for clear canvas command from Teacher App (handles nested properties and clearCanvas camelCase)
    const eventType = data.type || data.event || data.action || data.command || (data.data && data.data.type);
    if (eventType === "clear_canvas" || eventType === "clearCanvas" || eventType === "clear" || eventType === "clear_board") {
      this.handleClearCanvasReceived();
      return;
    }

    // Use Universal Stroke Extractor
    const extractedStrokes = this.extractStrokesFromPayload(data);
    if (extractedStrokes.length > 0) {
      extractedStrokes.forEach(s => this.handleLiveStrokeReceived(s));
      return;
    }

    // Check for caption_event or transcript_segment
    if (data.type === "caption_event" || data.type === "transcript_segment" || data.type === "segment" || data.segment || data.text || data.englishText) {
      const segData = data.segment || {
        id: "seg-" + Date.now(),
        startTime: 0,
        endTime: 10,
        englishText: data.englishText || data.text || data.transcript || "Spoken lecture segment...",
        translations: data.translations || {},
        technicalTerms: data.technicalTerms || []
      };
      this.handleLiveCaptionReceived(segData);
    }
  }

  handleClearCanvasReceived() {
    if (!this.isLiveMode || this.currentLecture !== this.liveSession) {
      this.switchToLiveStream();
    }

    // Clear strokes across ALL live segments so old strokes are never redrawn
    if (this.liveSession && this.liveSession.segments) {
      this.liveSession.segments.forEach(seg => {
        seg.strokes = [];
      });
    }

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.renderGridBackground();
    this.logToDebugConsole("CLEAR_CANVAS", "Canvas cleared completely across all segments.");
  }

  extractStrokesFromPayload(payload) {
    if (!payload) return [];

    let strokes = [];

    const unwrap = (obj) => {
      if (!obj) return;

      if (typeof obj === 'string') {
        try {
          obj = JSON.parse(obj);
        } catch (e) {
          return;
        }
      }

      // Case A: Array of point objects or coordinate pairs
      if (Array.isArray(obj)) {
        if (obj.length >= 2 && (Array.isArray(obj[0]) || (typeof obj[0] === 'object' && (obj[0].x !== undefined || obj[0].X !== undefined)))) {
          const sample = obj[0];
          const strokeColor = sample.color || sample.strokeColor || "#38bdf8";
          const strokeSize = sample.size || sample.strokeWidth || 3;
          strokes.push({ points: obj, color: strokeColor, size: strokeSize });
        } else {
          obj.forEach(item => unwrap(item));
        }
        return;
      }

      // Case B: Object container
      if (typeof obj === 'object') {
        if (obj.strokes) unwrap(obj.strokes);
        else if (obj.batch) unwrap(obj.batch);
        else if (obj.data) unwrap(obj.data);
        else if (obj.events) unwrap(obj.events);
        else if (obj.lines) unwrap(obj.lines);
        else if (obj.path) strokes.push(obj);
        else if (obj.points) strokes.push(obj);
        else if ((obj.x1 !== undefined && obj.x2 !== undefined) || (obj.prevX !== undefined && obj.currX !== undefined) || (obj.from && obj.to)) {
          const p1 = obj.from ? [obj.from.x || obj.from.X, obj.from.y || obj.from.Y] : [obj.x1 ?? obj.prevX, obj.y1 ?? obj.prevY];
          const p2 = obj.to ? [obj.to.x || obj.to.X, obj.to.y || obj.to.Y] : [obj.x2 ?? obj.currX, obj.y2 ?? obj.currY];
          strokes.push({ points: [p1, p2], color: obj.color || obj.strokeColor, size: obj.size || obj.strokeWidth });
        }
      }
    };

    unwrap(payload);
    return strokes;
  }

  switchToLiveStream() {
    this.isLiveMode = true;
    this.isPlaying = false; // Stop static recording replay timer loop
    
    if (!this.liveSession) {
      this.liveSession = {
        id: "live-teacher-stream",
        title: "🔴 Live Classroom Whiteboard Stream",
        instructor: "Teacher Device (Live Stream)",
        course: "Live Lecture",
        date: "Live Now",
        isLive: true,
        durationSeconds: 0,
        technicalTerms: ["recursion", "polymorphism", "base case", "binary tree", "memory", "algorithm", "pointer", "function"],
        segments: [
          {
            id: "live-seg-1",
            startTime: 0,
            endTime: 99999,
            englishText: "Live lecture stream connected. Teacher drawing strokes and captions will appear here in real time.",
            translations: {
              hi: "लाइव व्याख्यान स्ट्रीम कनेक्ट हुई। शिक्षक के व्हाइटबोर्ड चित्र और उपशीर्षक यहाँ वास्तविक समय में दिखाई देंगे।",
              bn: "লাইভ লেকচার স্ট্রিম সংযুক্ত হয়েছে। শিক্ষকের হোয়াইটবোর্ড অঙ্কন এবং সাবটাইটেল এখানে বাস্তব সময়ে প্রদর্শিত হবে।",
              ar: "تم اتصال البث المباشر. ستظهر رسومات السبورة والترجمة هنا في الوقت الفعلي."
            },
            strokes: []
          }
        ]
      };
    }

    this.currentLecture = this.liveSession;
    this.lectureTitleEl.textContent = this.currentLecture.title;
    this.instructorEl.textContent = this.currentLecture.instructor;

    // Clear static canvas and render live strokes
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.renderWhiteboardStrokes();
    this.renderCaptions();
  }

  handleLiveStrokeReceived(stroke) {
    if (!stroke) return;
    if (!this.isLiveMode || !this.liveSession || this.currentLecture !== this.liveSession) {
      this.switchToLiveStream();
    }

    if (!this.liveSession.segments || this.liveSession.segments.length === 0) {
      this.liveSession.segments = [
        {
          id: "live-seg-1",
          startTime: 0,
          endTime: 99999,
          englishText: "Live lecture stream connected.",
          translations: {},
          strokes: []
        }
      ];
    }

    let activeSeg = this.liveSession.segments[this.liveSession.segments.length - 1];
    if (!activeSeg) {
      activeSeg = this.liveSession.segments[0];
    }
    if (!activeSeg.strokes) {
      activeSeg.strokes = [];
    }

    activeSeg.strokes.push(stroke);
    this.drawSingleStroke(stroke);
  }

  handleLiveCaptionReceived(segment) {
    if (!this.isLiveMode || !this.liveSession || this.currentLecture !== this.liveSession) {
      this.switchToLiveStream();
    }

    if (!this.liveSession.segments) {
      this.liveSession.segments = [];
    }

    if (!segment.englishText) {
      segment.englishText = segment.text || segment.transcript || "Live spoken segment...";
    }
    if (!segment.translations) {
      segment.translations = {};
    }
    if (!segment.strokes) {
      segment.strokes = [];
    }

    this.liveSession.segments.push(segment);
    this.renderCaptions();

    if (this.isTTSOn) {
      this.speakCurrentSegment(segment);
    }
  }

  drawSingleStroke(stroke) {
    if (!stroke) return;

    let pts = stroke.points || stroke.path || (Array.isArray(stroke) ? stroke : null);
    if (!pts || !Array.isArray(pts) || pts.length < 2) return;

    let color = stroke.color || stroke.strokeColor || (pts[0] && pts[0].color) || "#38bdf8";
    // Invert black ink (#000000 / black) to high-contrast cyan for dark canvas visibility
    if (color === "#000000" || color === "#000" || color === "black" || (typeof color === "string" && color.toLowerCase() === "#090d16")) {
      color = "#38bdf8";
    }

    const size = stroke.size || stroke.strokeWidth || stroke.width || (pts[0] && pts[0].size) || 3;

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    const getCoords = (p) => {
      if (!p) return [0, 0];
      let x = Array.isArray(p) ? p[0] : (p.x !== undefined ? p.x : (p.X !== undefined ? p.X : (p.left !== undefined ? p.left : 0)));
      let y = Array.isArray(p) ? p[1] : (p.y !== undefined ? p.y : (p.Y !== undefined ? p.Y : (p.top !== undefined ? p.top : 0)));

      if (typeof x === 'string') x = parseFloat(x);
      if (typeof y === 'string') y = parseFloat(y);

      // Scaling for normalized 0..1 coordinates
      if (x <= 1.0 && y <= 1.0 && x > 0 && y > 0) {
        x *= this.canvasWidth;
        y *= this.canvasHeight;
      }
      return [x, y];
    };

    let [startX, startY] = getCoords(pts[0]);
    this.ctx.moveTo(startX, startY);

    for (let i = 1; i < pts.length; i++) {
      let [px, py] = getCoords(pts[i]);
      this.ctx.lineTo(px, py);
    }
    this.ctx.stroke();
  }

  populateLanguageDropdown() {
    this.langSelect.innerHTML = "";
    SUPPORTED_LANGUAGES.forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = `${lang.flag} ${lang.name}`;
      if (lang.code === this.currentLanguage) opt.selected = true;
      this.langSelect.appendChild(opt);
    });
  }

  populateSessionModal() {
    this.sessionList.innerHTML = "";

    // Add Live Teacher Stream as primary option
    const liveItem = document.createElement("div");
    liveItem.className = "session-item";
    liveItem.innerHTML = `
      <div>
        <div class="session-info-title">🔴 Live Classroom Stream</div>
        <div class="session-info-sub">Teacher Device • Real-time WebSocket</div>
      </div>
      <span class="live-indicator">● Live Stream</span>
    `;
    liveItem.addEventListener("click", () => {
      this.switchToLiveStream();
      this.closeModal();
    });
    this.sessionList.appendChild(liveItem);

    LECTURE_DATA.forEach(lec => {
      const item = document.createElement("div");
      item.className = "session-item";
      item.innerHTML = `
        <div>
          <div class="session-info-title">${lec.title}</div>
          <div class="session-info-sub">${lec.instructor} • ${lec.date}</div>
        </div>
        <span class="${lec.isLive ? 'live-indicator' : 'subtle-badge'}">
          ${lec.isLive ? '● Recorded Demo' : 'Recorded'}
        </span>
      `;
      item.addEventListener("click", () => {
        this.isLiveMode = false;
        this.loadLecture(lec);
        this.closeModal();
      });
      this.sessionList.appendChild(item);
    });
  }

  attachEventListeners() {
    window.addEventListener("resize", () => this.setupCanvas());

    this.langSelect.addEventListener("change", (e) => {
      this.currentLanguage = e.target.value;
      this.renderCaptions();
    });

    this.playBtn.addEventListener("click", () => this.togglePlayPause());

    this.timelineSlider.addEventListener("input", (e) => {
      this.currentTime = parseFloat(e.target.value);
      this.updateView();
    });

    this.ttsBtn.addEventListener("click", () => {
      this.isTTSOn = !this.isTTSOn;
      this.ttsBtn.classList.toggle("active", this.isTTSOn);
      this.ttsBtn.innerHTML = this.isTTSOn 
        ? `🔊 TTS On` 
        : `🔇 TTS Off`;
      if (this.isTTSOn && this.activeSegmentId) {
        this.speakCurrentSegment();
      }
    });

    this.speedSelect.addEventListener("change", (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
    });

    this.openSessionsBtn.addEventListener("click", () => this.openModal());
    this.closeModalBtn.addEventListener("click", () => this.closeModal());
    
    if (this.simLiveBtn) {
      this.simLiveBtn.addEventListener("click", () => this.simulateReconnection());
    }

    if (this.setUrlBtn) {
      this.setUrlBtn.addEventListener("click", () => {
        const current = this.getWebSocketUrl();
        const input = prompt("Enter your Render Backend WebSocket URL:\n(e.g., wss://smart-classroom-backend.onrender.com)", current);
        if (input) {
          localStorage.setItem("CUSTOM_BACKEND_WS_URL", input.trim());
          alert("Backend URL saved! Reconnecting...");
          if (this.ws) this.ws.close();
          this.connectWebSocket();
        }
      });
    }

    if (this.debugBtn) {
      this.debugBtn.addEventListener("click", () => {
        this.debugModal.classList.add("active");
        if (this.debugUrlStatus) {
          this.debugUrlStatus.textContent = `Connected WebSocket Target: ${this.getWebSocketUrl()}`;
        }
      });
    }

    if (this.closeDebugBtn) {
      this.closeDebugBtn.addEventListener("click", () => {
        this.debugModal.classList.remove("active");
      });
    }
  }

  loadLecture(lecture) {
    this.currentLecture = lecture;
    this.currentTime = 0;
    this.activeSegmentId = null;
    this.lectureTitleEl.textContent = lecture.title;
    this.instructorEl.textContent = lecture.instructor;
    
    if (lecture.isLive) {
      this.liveBadge.innerHTML = `<span class="pulse-dot"></span> LIVE NOW`;
      this.liveBadge.className = "live-indicator";
    } else {
      this.liveBadge.innerHTML = `RECORDED SESSION`;
      this.liveBadge.className = "live-indicator past";
    }

    this.timelineSlider.max = lecture.durationSeconds;
    this.totalTimeEl.textContent = this.formatTime(lecture.durationSeconds);
    
    this.renderCaptions();
    this.updateView();
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.playBtn.innerHTML = this.isPlaying ? "❚❚" : "▶";
  }

  startPlaybackLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 0.2 * this.playbackSpeed;
        if (this.currentTime >= this.currentLecture.durationSeconds) {
          this.currentTime = this.currentLecture.durationSeconds;
          this.isPlaying = false;
          this.playBtn.innerHTML = "▶";
        }
        this.updateView();
      }
    }, 200);
  }

  updateView() {
    this.timelineSlider.value = this.currentTime;
    this.currentTimeEl.textContent = this.formatTime(this.currentTime);

    // Identify active segment
    const activeSeg = this.currentLecture.segments.find(
      s => this.currentTime >= s.startTime && this.currentTime <= s.endTime
    ) || this.currentLecture.segments[this.currentLecture.segments.length - 1];

    if (activeSeg && activeSeg.id !== this.activeSegmentId) {
      this.activeSegmentId = activeSeg.id;
      this.highlightActiveCaption(activeSeg.id);
      if (this.isTTSOn) {
        this.speakCurrentSegment(activeSeg);
      }
    }

    this.renderWhiteboardStrokes();
  }

  renderGridBackground() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvasWidth; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvasHeight; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  renderWhiteboardStrokes() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.renderGridBackground();

    // Render strokes up to currentTime
    this.currentLecture.segments.forEach(segment => {
      if (this.currentTime < segment.startTime) return;

      const isCurrentSeg = this.currentTime >= segment.startTime && this.currentTime <= segment.endTime;
      let strokeProgressRatio = 1.0;
      if (isCurrentSeg) {
        const segDuration = segment.endTime - segment.startTime;
        strokeProgressRatio = Math.min(1.0, (this.currentTime - segment.startTime) / segDuration);
      }

      segment.strokes.forEach(stroke => {
        const pointCount = Math.floor(stroke.points.length * strokeProgressRatio);
        if (pointCount < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = stroke.color || "#38bdf8";
        this.ctx.lineWidth = stroke.size || 3;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        this.ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
        for (let i = 1; i < pointCount; i++) {
          this.ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
        }
        this.ctx.stroke();
      });
    });
  }

  renderCaptions() {
    this.captionFeed.innerHTML = "";

    this.currentLecture.segments.forEach(segment => {
      if (!segment.translations) segment.translations = {};

      const card = document.createElement("div");
      card.className = `caption-card ${segment.id === this.activeSegmentId ? 'active' : ''}`;
      card.id = `card-${segment.id}`;

      // Get translation or default to English
      let rawText = segment.englishText;
      if (this.currentLanguage !== "en" && segment.translations[this.currentLanguage]) {
        rawText = segment.translations[this.currentLanguage];
      }

      const formattedText = this.preserveTechnicalTerms(rawText, this.currentLecture.technicalTerms);

      card.innerHTML = `
        <div class="caption-meta">
          <span class="caption-speaker">${this.currentLecture.instructor}</span>
          <span class="caption-time">${this.formatTime(segment.startTime)} - ${this.formatTime(segment.endTime)}</span>
        </div>
        <div class="caption-text" id="text-${segment.id}">${formattedText}</div>
      `;

      card.addEventListener("click", () => {
        this.currentTime = segment.startTime;
        this.isPlaying = true;
        this.playBtn.innerHTML = "❚❚";
        this.updateView();
      });

      this.captionFeed.appendChild(card);

      // If target language is non-English and missing translation, fetch translation live
      if (this.currentLanguage !== "en" && !segment.translations[this.currentLanguage]) {
        const textEl = card.querySelector(".caption-text");
        this.translateSegment(segment, this.currentLanguage, textEl);
      }
    });
  }

  translateSegment(segment, targetLang, cardTextElement) {
    if (!segment.englishText || targetLang === "en") return;
    if (!segment.translations) segment.translations = {};

    if (segment.translations[targetLang]) {
      if (cardTextElement) {
        cardTextElement.innerHTML = this.preserveTechnicalTerms(segment.translations[targetLang], this.currentLecture.technicalTerms);
      }
      return;
    }

    const srcText = segment.englishText;
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(srcText)}&langpair=en|${targetLang}`;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data && data.responseData && data.responseData.translatedText) {
          let translated = data.responseData.translatedText;
          segment.translations[targetLang] = translated;
          if (cardTextElement && this.currentLanguage === targetLang) {
            cardTextElement.innerHTML = this.preserveTechnicalTerms(translated, this.currentLecture.technicalTerms);
          }
        }
      })
      .catch(err => {
        console.log("Translation API fetch error:", err);
      });
  }

  preserveTechnicalTerms(text, terms) {
    let result = text;
    terms.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, "gi");
      result = result.replace(regex, `<span class="tech-chip">$1</span>`);
    });
    return result;
  }

  highlightActiveCaption(activeId) {
    document.querySelectorAll(".caption-card").forEach(card => card.classList.remove("active"));
    const activeCard = document.getElementById(`card-${activeId}`);
    if (activeCard) {
      activeCard.classList.add("active");
      activeCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  speakCurrentSegment(segmentOverride) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // Stop previous audio

    const seg = segmentOverride || this.currentLecture.segments.find(s => s.id === this.activeSegmentId);
    if (!seg) return;

    let textToSpeak = seg.englishText;
    if (this.currentLanguage !== "en" && seg.translations[this.currentLanguage]) {
      textToSpeak = seg.translations[this.currentLanguage];
    }

    // Clean HTML tags for speech
    const cleanText = textToSpeak.replace(/<[^>]*>/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage);
    if (langObj) {
      utterance.lang = langObj.ttsCode;
    }

    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  simulateReconnection() {
    this.reconnectBanner.style.display = "flex";
    setTimeout(() => {
      this.reconnectBanner.style.display = "none";
    }, 3000);
  }

  openModal() {
    this.sessionModal.classList.add("active");
  }

  closeModal() {
    this.sessionModal.classList.remove("active");
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Initialize Application when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new SmartClassroomApp();
});

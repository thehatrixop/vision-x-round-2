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
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = rect.width || 800;
    this.canvasHeight = rect.height || 500;
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket("ws://localhost:5000?role=student");

      this.ws.onopen = () => {
        this.isBackendConnected = true;
        this.liveBadge.innerHTML = `<span class="pulse-dot"></span> LIVE BACKEND CONNECTED`;
        this.liveBadge.className = "live-indicator";
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "stroke_event" && data.stroke) {
            this.handleLiveStrokeReceived(data.stroke);
          } else if (data.type === "caption_event" && data.segment) {
            this.handleLiveCaptionReceived(data.segment);
          }
        } catch (e) {
          console.log("WebSocket JSON message parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.isBackendConnected = false;
        // Attempt silent reconnect in 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.ws.onerror = () => {
        this.isBackendConnected = false;
      };
    } catch (err) {
      console.log("WebSocket connection skipped (Backend offline). Using demo dataset.");
    }
  }

  handleLiveStrokeReceived(stroke) {
    if (!this.currentLecture.segments.length) return;
    const activeSeg = this.currentLecture.segments[this.currentLecture.segments.length - 1];
    activeSeg.strokes.push(stroke);
    this.renderWhiteboardStrokes();
  }

  handleLiveCaptionReceived(segment) {
    this.currentLecture.segments.push(segment);
    this.currentLecture.durationSeconds = Math.max(this.currentLecture.durationSeconds, segment.endTime);
    this.timelineSlider.max = this.currentLecture.durationSeconds;
    this.totalTimeEl.textContent = this.formatTime(this.currentLecture.durationSeconds);
    this.renderCaptions();
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
    LECTURE_DATA.forEach(lec => {
      const item = document.createElement("div");
      item.className = "session-item";
      item.innerHTML = `
        <div>
          <div class="session-info-title">${lec.title}</div>
          <div class="session-info-sub">${lec.instructor} • ${lec.date}</div>
        </div>
        <span class="${lec.isLive ? 'live-indicator' : 'subtle-badge'}">
          ${lec.isLive ? '● Live' : 'Recorded'}
        </span>
      `;
      item.addEventListener("click", () => {
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

  renderWhiteboardStrokes() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw grid background subtle
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
        <div class="caption-text">${formattedText}</div>
      `;

      card.addEventListener("click", () => {
        this.currentTime = segment.startTime;
        this.isPlaying = true;
        this.playBtn.innerHTML = "❚❚";
        this.updateView();
      });

      this.captionFeed.appendChild(card);
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

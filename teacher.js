/**
 * Teacher Whiteboard Pad & Speech Broadcast Logic
 * Connects to backend WebSocket and streams vector stroke events and live captions.
 */

class TeacherApp {
  constructor() {
    this.ws = null;
    this.isDrawing = false;
    this.currentTool = "pen"; // "pen" or "eraser"
    this.currentColor = "#38bdf8";
    this.currentSize = 4;
    this.currentStrokePoints = [];

    // DOM Elements
    this.canvas = document.getElementById("teacher-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.statusBadge = document.getElementById("teacher-live-badge");
    this.setUrlBtn = document.getElementById("set-url-btn");
    this.speechInput = document.getElementById("speech-input");
    this.sendCaptionBtn = document.getElementById("send-caption-btn");
    this.clearBoardBtn = document.getElementById("clear-board-btn");
    this.toolPen = document.getElementById("tool-pen");
    this.toolEraser = document.getElementById("tool-eraser");
    this.sizeSlider = document.getElementById("size-slider");
    this.sizeVal = document.getElementById("size-val");
    this.swatches = document.querySelectorAll(".color-swatch");
    this.presetChips = document.querySelectorAll(".preset-chip");

    this.init();
  }

  init() {
    this.setupCanvas();
    this.attachEventListeners();
    this.connectWebSocket();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = (rect.width || 800) * dpr;
    this.canvas.height = (rect.height || 500) * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.canvasWidth = rect.width || 800;
    this.canvasHeight = rect.height || 500;

    // Draw dark background grid
    this.ctx.fillStyle = "#030712";
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  getWebSocketUrl() {
    let targetUrl = localStorage.getItem("CUSTOM_BACKEND_WS_URL");
    if (!targetUrl || targetUrl.trim() === "") {
      targetUrl = "wss://smart-classroom-backend-iueo.onrender.com";
    }

    targetUrl = targetUrl.trim();
    if (targetUrl.startsWith("http://")) targetUrl = "ws://" + targetUrl.slice(7);
    else if (targetUrl.startsWith("https://")) targetUrl = "wss://" + targetUrl.slice(8);
    if (!targetUrl.startsWith("ws://") && !targetUrl.startsWith("wss://")) targetUrl = "wss://" + targetUrl;

    if (!targetUrl.includes("?role=") && !targetUrl.includes("&role=")) {
      targetUrl += targetUrl.includes("?") ? "&role=teacher" : "?role=teacher";
    } else {
      targetUrl = targetUrl.replace("role=student", "role=teacher");
    }

    return targetUrl;
  }

  connectWebSocket() {
    try {
      const wsUrl = this.getWebSocketUrl();
      console.log("Teacher App Connecting to WebSocket:", wsUrl);

      const cleanUrl = wsUrl.replace("wss://", "").replace("ws://", "").replace("?role=teacher", "");
      this.statusBadge.innerHTML = `<span class="pulse-dot"></span> CONNECTING...`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.statusBadge.innerHTML = `<span class="pulse-dot"></span> TEACHER LIVE: ${cleanUrl}`;
        this.statusBadge.className = "live-indicator";
      };

      this.ws.onclose = () => {
        this.statusBadge.innerHTML = `⚠️ SERVER OFFLINE: Retrying...`;
        this.statusBadge.className = "live-indicator past";
        setTimeout(() => this.connectWebSocket(), 4000);
      };

      this.ws.onerror = () => {
        this.statusBadge.innerHTML = `⚠️ SERVER ERROR`;
      };
    } catch (e) {
      console.log("WebSocket connection failed:", e);
    }
  }

  attachEventListeners() {
    window.addEventListener("resize", () => this.setupCanvas());

    // Mouse Drawing Events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseleave", () => this.stopDrawing());

    // Touch Drawing Events for Tablets / Mobile
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.startDrawing(e.touches[0]);
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.draw(e.touches[0]);
    });
    this.canvas.addEventListener("touchend", () => this.stopDrawing());

    // Toolbar Controls
    this.toolPen.addEventListener("click", () => {
      this.currentTool = "pen";
      this.toolPen.classList.add("active");
      this.toolEraser.classList.remove("active");
    });

    this.toolEraser.addEventListener("click", () => {
      this.currentTool = "eraser";
      this.toolEraser.classList.add("active");
      this.toolPen.classList.remove("active");
    });

    this.swatches.forEach(swatch => {
      swatch.addEventListener("click", () => {
        this.swatches.forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
        this.currentColor = swatch.getAttribute("data-color");
        this.currentTool = "pen";
        this.toolPen.classList.add("active");
        this.toolEraser.classList.remove("active");
      });
    });

    this.sizeSlider.addEventListener("input", (e) => {
      this.currentSize = parseInt(e.target.value);
      this.sizeVal.textContent = `${this.currentSize}px`;
    });

    this.clearBoardBtn.addEventListener("click", () => {
      this.ctx.fillStyle = "#030712";
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    });

    // Caption Broadcast
    this.sendCaptionBtn.addEventListener("click", () => this.broadcastCaption());

    this.presetChips.forEach(chip => {
      chip.addEventListener("click", () => {
        this.speechInput.value = chip.getAttribute("data-text");
        this.broadcastCaption();
      });
    });

    // Backend URL Config Button
    this.setUrlBtn.addEventListener("click", () => {
      const current = this.getWebSocketUrl();
      const input = prompt("Enter Backend WebSocket URL for Teacher App:\n(e.g., wss://smart-classroom-backend.onrender.com)", current);
      if (input) {
        localStorage.setItem("CUSTOM_BACKEND_WS_URL", input.trim());
        alert("Teacher App WebSocket URL updated! Reconnecting...");
        if (this.ws) this.ws.close();
        this.connectWebSocket();
      }
    });
  }

  getCanvasCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))];
  }

  startDrawing(e) {
    this.isDrawing = true;
    const [normX, normY] = this.getCanvasCoordinates(e);
    this.currentStrokePoints = [[normX, normY]];

    const pixelX = normX * this.canvasWidth;
    const pixelY = normY * this.canvasHeight;

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.currentTool === "eraser" ? "#030712" : this.currentColor;
    this.ctx.lineWidth = this.currentTool === "eraser" ? this.currentSize * 3 : this.currentSize;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.moveTo(pixelX, pixelY);
  }

  draw(e) {
    if (!this.isDrawing) return;
    const [normX, normY] = this.getCanvasCoordinates(e);
    this.currentStrokePoints.push([normX, normY]);

    const pixelX = normX * this.canvasWidth;
    const pixelY = normY * this.canvasHeight;
    this.ctx.lineTo(pixelX, pixelY);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentStrokePoints.length >= 2) {
      this.broadcastStroke({
        tool: this.currentTool,
        color: this.currentTool === "eraser" ? "#030712" : this.currentColor,
        size: this.currentTool === "eraser" ? this.currentSize * 3 : this.currentSize,
        points: this.currentStrokePoints
      });
    }

    this.currentStrokePoints = [];
  }

  broadcastStroke(stroke) {
    if (!this.ws || this.ws.readyState !== 1) return;

    const payload = {
      role: "teacher",
      type: "stroke_event",
      stroke: stroke,
      strokes: [stroke]
    };

    this.ws.send(JSON.stringify(payload));
  }

  broadcastCaption() {
    const text = this.speechInput.value.trim();
    if (!text) return;

    // Quick automatic translation generator for demo
    const hiText = text.replace(/recursion/gi, "recursion")
                       .replace(/call stack/gi, "call stack")
                       .replace(/base case/gi, "base case")
                       .replace(/binary search tree/gi, "binary search tree");

    const payload = {
      role: "teacher",
      type: "caption_event",
      segment: {
        id: "seg-" + Date.now(),
        startTime: 0,
        endTime: 10,
        englishText: text,
        translations: {
          hi: `[व्याख्यान]: ${hiText}`,
          bn: `[বক্তৃতা]: ${hiText}`,
          ar: `[محاضرة]: ${text}`
        },
        technicalTerms: ["recursion", "call stack", "base case", "polymorphism", "vtable", "semaphore"]
      }
    };

    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(payload));
    }

    this.speechInput.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.teacherApp = new TeacherApp();
});

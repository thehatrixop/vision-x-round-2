========================================================================
             RENDER DEPLOYMENT GUIDE - SMART CLASSROOM SYSTEM
========================================================================

This project consists of two components that can be hosted on Render.com:
1. Backend Node.js WebSocket & REST Server
2. Frontend Student Web Application (Static Site)

------------------------------------------------------------------------
STEP 1: DEPLOY THE BACKEND WEBSOCKET SERVER ON RENDER
------------------------------------------------------------------------
1. Go to https://dashboard.render.com and click "New +" -> "Web Service".
2. Connect your GitHub repository: https://github.com/thehatrixop/vision-x-round-2.git
3. Configure the Web Service settings:
   - Name: smart-classroom-backend
   - Region: Choose nearest region (e.g., Singapore / US East)
   - Branch: main
   - Root Directory: server
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
   - Instance Type: Free
4. Click "Create Web Service".
5. Once deployed, copy your backend URL (e.g., https://smart-classroom-backend.onrender.com).

------------------------------------------------------------------------
STEP 2: DEPLOY THE FRONTEND STUDENT WEB APPLICATION ON RENDER
------------------------------------------------------------------------
1. On Render Dashboard, click "New +" -> "Static Site".
2. Select the same repository: https://github.com/thehatrixop/vision-x-round-2.git
3. Configure the Static Site settings:
   - Name: smart-classroom-student-app
   - Branch: main
   - Root Directory: ./
   - Build Command: (Leave empty)
   - Publish Directory: ./
4. Click "Create Static Site".
5. Your frontend is live! (e.g., https://smart-classroom-student-app.onrender.com)

------------------------------------------------------------------------
STEP 3: WEBSOCKET REAL-TIME SYNC SETUP
------------------------------------------------------------------------
- Render WebSockets use SSL standard: `wss://<your-backend-name>.onrender.com`
- For Teacher App (your friend's app):
  Connect via WebSocket: `wss://<your-backend-name>.onrender.com?role=teacher`
  Or send HTTP POSTs to: `https://<your-backend-name>.onrender.com/api/teacher/stroke`

========================================================================

# 🔮 Tix Tac Tox — Liquid Glass Multiplayer Arena

An immersive, real-time multiplayer Tic-Tac-Toe arena crafted with a **minimalist, transition-heavy liquid-glass induced design language**. Built from scratch using Vite, React, Express, and Socket.io.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farunangshuxroy%2Ftix-tac-tox&root-directory=client)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/arunangshuxroy/tix-tac-tox)

---

## ✨ Features

- **Fluid Ambient Backgrounds**: 3 floating organic blobs that morph and warp dynamically under deep `40px` backdrop blur.
- **Specular Glass Cards**: Semi-translucent panels with double inset glass-edge highlights for glistening realistic reflections.
- **Borderless Gameplay Grid**: High-contrast, elegant minimal vector shapes (Neon Magenta X and Neon Blue O) that draw themselves upon placement.
- **Integrated Synthesizer**: Custom retro sound effects generated programmatically on-the-fly via the standard browser **Web Audio API** (Pop, triads, draws, invalid cell alerts).
- **Spectator Mode**: Support for unlimited live observers to sync turns and join the arena chat lobby.
- **Interactive Floating Reactions**: Express emojis hot-bar generating animated emoji particles floating up the screen with randomized trajectories and wind effects.

---

## 🚀 Local Quickstart

### 1. Install & Run
From the project root directory:
```bash
# Install dependencies for both server and client
npm run install-all

# Start both servers concurrently
npm run dev
```

- **Frontend (Client)**: Runs at `http://localhost:5173`
- **Backend (Socket Server)**: Runs at `http://localhost:3001`

---

## ☁️ Production Deployment

### 1. Deploy the Backend (Render)
1. Click the **Deploy to Render** button above or visit [Render](https://render.com/).
2. It will read the `render.yaml` configuration and provision your service automatically!
3. Copy your live backend web service URL (e.g., `https://tix-tac-tox-backend.onrender.com`).

### 2. Deploy the Frontend (Vercel)
1. Click the **Deploy with Vercel** button above.
2. In the setup, add a new **Environment Variable**:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: `https://your-backend-service.onrender.com` (Your Render backend URL from Step 1)
3. Click **Deploy**.

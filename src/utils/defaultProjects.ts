import { Project } from '../types/editor';

export const INITIAL_PROJECT: Project = {
  id: 'my-first-website',
  name: 'My first website',
  description: 'A modern interactive website built with gCAD Code Editor',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  folders: ['assets', 'assets/icons', 'src'],
  files: [
    {
      id: 'file-1',
      name: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-container">
    <header class="hero">
      <div class="logo-badge" id="appLogo">⚡ gCAD</div>
      <h1 class="title">Welcome to My First Website</h1>
      <p class="subtitle">Crafted live in <strong>gCAD Code Editor</strong> — fast, sleek, and offline ready.</p>
      <div class="cta-group">
        <button class="btn btn-primary" onclick="triggerMagic()">Explore Features</button>
        <button class="btn btn-secondary" onclick="toggleTheme()">Toggle Theme</button>
      </div>
    </header>

    <main class="grid-features">
      <div class="card">
        <div class="icon">🚀</div>
        <h3>Instant Preview</h3>
        <p>Real-time visual rendering with PC, Tablet, and Mobile viewport modes.</p>
      </div>
      <div class="card">
        <div class="icon">🤖</div>
        <h3>AI Assistant</h3>
        <p>Full-time coding agent that builds, refactors, and injects logos with precision.</p>
      </div>
      <div class="card">
        <div class="icon">📦</div>
        <h3>Universal Compiler</h3>
        <p>Package projects for Web, Android APK, Windows EXE, and macOS AppImage.</p>
      </div>
    </main>

    <footer class="footer">
      <p>Status: <span id="runtimeStatus" class="status-pill">Ready & Running</span></p>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
    },
    {
      id: 'file-2',
      name: 'style.css',
      language: 'css',
      content: `:root {
  --bg-primary: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.85);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --accent: #38bdf8;
  --accent-hover: #0284c7;
  --border: rgba(255, 255, 255, 0.1);
}

body.light-theme {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border: rgba(0, 0, 0, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  background: var(--bg-primary);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  transition: background 0.3s ease, color 0.3s ease;
}

.app-container {
  max-width: 900px;
  width: 100%;
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

.hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-badge {
  display: inline-block;
  padding: 0.4rem 1.2rem;
  background: linear-gradient(135deg, #0ea5e9, #10b981);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto 1.5rem;
}

.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0284c7;
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.grid-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card .icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.card h3 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.card p {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.4;
}

.footer {
  border-top: 1px solid var(--border);
  padding-top: 1.25rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-pill {
  color: #10b981;
  font-weight: 600;
}`,
    },
    {
      id: 'file-3',
      name: 'script.js',
      language: 'javascript',
      content: `// Interactive script for My First Website
console.log('gCAD Code Editor live runtime loaded!');

function triggerMagic() {
  const statusEl = document.getElementById('runtimeStatus');
  if (statusEl) {
    statusEl.innerText = '⚡ Sparked by gCAD!';
    statusEl.style.color = '#38bdf8';
  }

  // Visual burst
  const title = document.querySelector('.title');
  if (title) {
    title.style.transform = 'scale(1.05)';
    setTimeout(() => {
      title.style.transform = 'scale(1)';
    }, 300);
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  console.log('Theme toggled. Light mode:', document.body.classList.contains('light-theme'));
}

window.addEventListener('load', () => {
  console.log('All project assets initialized successfully.');
});`,
    },
    {
      id: 'file-4',
      name: 'App.json',
      language: 'json',
      // Subtle syntax error: trailing comma after "version": "1.0.0", to trigger the wavy error underline shown in the UI image
      content: `{
  "name": "My first website",
  "version": "1.0.0",
  "private": true,
  "theme": "dark",
  "buildTarget": "web",
}`,
    },
    {
      id: 'file-5',
      name: 'main.py',
      language: 'python',
      content: `# Optional Python backend utility or CLI automation
import sys

def run_project_check():
    print("gCAD Python Runtime Engine: OK")
    print("Project: My first website")

if __name__ == "__main__":
    run_project_check()`,
    },
  ],
};

export const SAMPLE_PROJECT_TEMPLATES: Project[] = [
  INITIAL_PROJECT,
  {
    id: 'retro-canvas-game',
    name: 'Retro Space Shooter',
    description: 'HTML5 2D arcade game with smooth 60fps canvas animation and score counter',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now(),
    folders: ['src', 'sounds'],
    files: [
      {
        id: 'game-html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Space Blaster 2D</title>
  <style>
    body { margin: 0; background: #000; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; font-family: monospace; }
    canvas { border: 2px solid #38bdf8; border-radius: 8px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.4); }
    .hud { margin-bottom: 10px; font-size: 18px; }
  </style>
</head>
<body>
  <div class="hud">SCORE: <span id="score">0</span> | LIVES: <span id="lives">3</span></div>
  <canvas id="gameCanvas" width="600" height="400"></canvas>
  <p style="margin-top: 10px; color: #94a3b8;">Use Arrow Keys to Move • Spacebar to Fire</p>
  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let player = { x: 280, y: 350, w: 40, h: 20, speed: 6 };
    let bullets = [];
    let enemies = [];
    let keys = {};

    window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') fire(); });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    function fire() {
      bullets.push({ x: player.x + player.w/2 - 2, y: player.y, w: 4, h: 10 });
    }

    setInterval(() => {
      enemies.push({ x: Math.random() * (canvas.width - 30), y: 0, w: 30, h: 20, speed: 2 + Math.random()*2 });
    }, 1000);

    function update() {
      if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
      if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;

      bullets.forEach((b, i) => { b.y -= 7; if (b.y < 0) bullets.splice(i, 1); });
      enemies.forEach((en, i) => {
        en.y += en.speed;
        bullets.forEach((b, bi) => {
          if (b.x < en.x + en.w && b.x + b.w > en.x && b.y < en.y + en.h && b.y + b.h > en.y) {
            enemies.splice(i, 1);
            bullets.splice(bi, 1);
            score += 100;
            document.getElementById('score').innerText = score;
          }
        });
        if (en.y > canvas.height) enemies.splice(i, 1);
      });
    }

    function draw() {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(player.x, player.y, player.w, player.h);

      // Bullets
      ctx.fillStyle = '#facc15';
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Enemies
      ctx.fillStyle = '#ef4444';
      enemies.forEach(en => ctx.fillRect(en.x, en.y, en.w, en.h));
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'saas-dashboard',
    name: 'CloudMetrics SaaS Dashboard',
    description: 'Modern administrative dashboard with stats, interactive cards, and responsive tables',
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now(),
    folders: ['src', 'css', 'js'],
    files: [
      {
        id: 'dash-html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CloudMetrics Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold">⚡</div>
        <h1 class="text-xl font-bold">CloudMetrics Live Portal</h1>
      </div>
      <button class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition">Export Report</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Total Users</p>
        <h3 class="text-2xl font-bold mt-1 text-emerald-400">48,290</h3>
        <span class="text-xs text-emerald-500">+12% this week</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Active Nodes</p>
        <h3 class="text-2xl font-bold mt-1 text-cyan-400">1,402</h3>
        <span class="text-xs text-cyan-500">99.98% Uptime</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Throughput</p>
        <h3 class="text-2xl font-bold mt-1 text-purple-400">1.8 GB/s</h3>
        <span class="text-xs text-purple-400">Peak Load OK</span>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Error Rate</p>
        <h3 class="text-2xl font-bold mt-1 text-rose-400">0.012%</h3>
        <span class="text-xs text-rose-400">Optimal status</span>
      </div>
    </div>
  </div>
</body>
</html>`,
      },
    ],
  },
];

export const ONLINE_STARTER_PROJECTS = [
  {
    id: 'online-1',
    name: 'NexPay FinTech Landing',
    author: 'gcad-community',
    stars: 489,
    category: 'Landing Page',
    description: 'Futuristic FinTech payment application landing with gradients and sleek buttons.',
  },
  {
    id: 'online-2',
    name: '3D Cyber Matrix Experience',
    author: 'webgl-master',
    stars: 820,
    category: 'Three.js / Canvas',
    description: 'Immersive neon matrix canvas animation with interactive audio visualization.',
  },
  {
    id: 'online-3',
    name: 'TaskMaster Kanban Board',
    author: 'productivity-team',
    stars: 640,
    category: 'Productivity App',
    description: 'Drag-and-drop offline Kanban board with local storage persistence and tag filters.',
  },
  {
    id: 'online-4',
    name: 'Retro Synthwave Radio',
    author: 'audio-dev',
    stars: 1250,
    category: 'Audio / Media',
    description: '80s aesthetic lo-fi and synthwave live audio web player with equalizer canvas.',
  },
];

# PulseTeam - Task & Workflow Command

A modern, real-time task assignment and workflow management application tailored for small teams, supervisors (SPV), and individual contributors.

---

## ✨ Key Features

- **⏱️ Real-Time Stopwatch & Timers**: Track time per task with live digital counters, work session logging, and an omnipresent floating timer dock.
- **📱 WhatsApp Direct Notifications**: Instant click-to-chat links (`wa.me`) with pre-formatted templates for task assignments, blocker pings, status changes, and completions.
- **🚁 Supervisor (SPV) "Helicopter View"**: 360° operational visibility, staff workload & capacity gauges, and blocker radar for bottleneck management.
- **🎯 "My Tasks" Focus Cockpit**: Personalized staff queue with 1-click status bumpers, prominent priority tags, and stopwatch controls.
- **⚡ Task Prioritization**: Set and re-prioritize deliverables across 4 levels (`Urgent`, `High`, `Medium`, `Low`) with visual cues and priority sorting.
- **🔍 Universal Search & Filtering**: Real-time filtering by keywords, assignee, status, priority, and due dates across the Board, Dashboard, and My Tasks.
- **📊 Productivity Analytics**: Comprehensive workload distribution meters, status distribution, and CSV report export for sprint retrospectives.
- **🔄 Real-Time Multi-Tab Sync**: Seamless cross-window synchronization via the browser's `BroadcastChannel` API.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
The compiled, production-ready static assets will be output to the `dist/` folder.

---

## 🐙 How to Publish to GitHub

Follow these steps from your terminal inside the project directory:

### Step 1: Initialize Git and Create Initial Commit (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: PulseTeam task management app"
```

### Step 2: Create a New Repository on GitHub
1. Go to [GitHub - New Repository](https://github.com/new).
2. Enter a repository name (e.g., `pulseteam-task-manager`).
3. Leave it Public or Private, and do **not** check "Initialize with a README" (we already have one).
4. Click **Create repository**.

### Step 3: Link and Push to GitHub
Copy the commands provided by GitHub (replace `<YOUR_USERNAME>` with your GitHub username):

```bash
# Rename default branch to main
git branch -M main

# Add your GitHub repository as origin
git remote add origin https://github.com/<YOUR_USERNAME>/pulseteam-task-manager.git

# Push code to GitHub
git push -u origin main
```

*(Alternatively, if you use the GitHub CLI: `gh repo create pulseteam-task-manager --public --source=. --push`)*

---

## 🌐 How to Deploy to Your Website

Because PulseTeam is a React single-page application built with Vite, it can be deployed to any static web hosting service in minutes:

### Option A: Deploy to Vercel (Recommended - Easiest & Free)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Select your `pulseteam-task-manager` repository from GitHub.
4. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be live instantly on a free `.vercel.app` URL, and you can connect your custom domain under **Settings -> Domains**.

---

### Option B: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and log in.
2. Click **Add new site** -> **Import an existing project** (connect GitHub).
3. Select `pulseteam-task-manager`.
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy Site**. Add your custom domain in **Domain management**.

*(Or drag-and-drop the generated `dist/` folder directly to Netlify Drop at https://app.netlify.com/drop)*

---

### Option C: Deploy to Cloudflare Pages
1. Go to Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your GitHub repository.
3. Build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

### Option D: Deploy to Custom VPS / Server (Nginx / Apache / Caddy)
1. Run `npm run build` locally or in CI/CD to generate the `dist/` directory.
2. Copy the files inside `dist/` to your server's web root (e.g., `/var/www/pulseteam/`).
3. Configure your web server for Single-Page Application (SPA) routing:

#### Example Nginx Configuration (`/etc/nginx/sites-available/pulseteam`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/pulseteam;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```
4. Obtain a free SSL certificate with Certbot:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **State & Realtime**: React Context + localStorage + BroadcastChannel API

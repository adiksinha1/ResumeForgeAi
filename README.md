# ResumeForge AI 🚀

> **ResumeForge AI** is a premium, state-of-the-art AI-powered resume builder designed for modern software engineers. It scans resumes against ATS filters, tailors bullet points using Gemini AI models, connects with GitHub to highlight top achievements, and renders high-fidelity PDF/DOCX templates.

---

## 🎨 Auroral Midnight Visual Theme

The application features a custom, hand-crafted design system called **"Auroral Midnight"** to provide a highly premium, human-designed aesthetic. It moves away from generic, overused AI templates by introducing:

* **Interactive Live Wallpaper:** A dynamic, physics-based canvas particle node network that floats ambiently and connects/reacts dynamically to user mouse interactions.
* **Balanced Color Accents:** Elegant use of **Auroral Teal**, **Oceanic Cyan**, **Sunset Rose**, and **Amber Gold** across dashboards, action buttons, status gauges, and templates.
* **Premium Glassmorphism:** Sleek card structures, translucent modals, and blur filters to ensure high visual depth and readability.

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Redux Toolkit (state management), Tailwind CSS (styling), Framer Motion (micro-animations), Lucide (icon library).
* **Backend:** Node.js, Express.js (REST API), Mongoose (ODM), Puppeteer (PDF rendering), Redis (caching).
* **Database & In-Memory Fallback:** MongoDB (primary datastore). When MongoDB or Redis is not running locally, the server automatically hooks into a **custom in-memory mock database** (seeded from `mock_db_data.json` at the root) to run 100% standalone.

---

## 🌟 Key Features

1. **ATS Optimization Engine:** Scans readability indices, evaluates formatting layout, flags duplicated skills, and scores resumes in real-time.
2. **Gemini AI Assistant:** Automatically drafts cover letters, provides interview preparation advice, suggests technical skills, and refines bullet points.
3. **GitHub Sync Integration:** Connects with GitHub profile APIs to fetch top repositories, language distributions, contribution activity, and recommend stellar projects.
4. **Dual Downloads:** High-fidelity Puppeteer PDF generation and standard XML-formatted Microsoft Word DOCX documents.
5. **Instant Demo Mode:** Sign in instantly with pre-seeded developer data to preview all dashboards and features without register setup.

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (Version >= 18.0.0)
* *Optional:* [Docker](https://www.docker.com/) (if running database services in containers)

### Setup & Run (Standard Local Mode)

1. **Install All Dependencies:**
   Install root-level, frontend, and backend packages with a single command:
   ```bash
   npm run install-all
   ```

2. **Start Dev Servers:**
   Boot up both the Node/Express backend and Vite frontend concurrently:
   ```bash
   npm run dev
   ```
   * The frontend will start at: **http://localhost:5173/**
   * The backend will start at: **http://localhost:5000/**

*Note: If no local MongoDB is running, the server will display connection warnings and automatically fallback to local JSON database simulation mode (`mock_db_data.json`).*

---

### Setup & Run (Docker Container Mode)

If you have Docker installed and want to run the full stack (including local MongoDB and Redis instances in containers):

1. **Build and Start Container Cluster:**
   ```bash
   npm run docker-up
   ```
   Or use docker-compose commands:
   ```bash
   docker-compose up -d --build
   ```

2. **Stop Containers:**
   ```bash
   docker-compose down
   ```

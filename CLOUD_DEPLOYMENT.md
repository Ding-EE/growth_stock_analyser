# 100% Free Cloud Deployment Guide
## Run Growth Stock Analyser 24/7 Without Your Local Machine

You can host this full-stack application online for **$0.00** so you can access it from your smartphone, iPad, or any computer anywhere in the world, even when your PC is completely turned off.

---

## 🌟 Recommended Option 1: Render.com (Easiest 1-Click Setup)

Render offers a generous free tier with **750 free hours/month** (runs 24/7 all month long) and automated HTTPS (`https://your-app.onrender.com`).

### Step 1: Push Code to GitHub
1. Create a free account at [github.com](https://github.com) if you don't already have one.
2. Create a new repository named `growth-stock-analyser` (can be **Private** or **Public**).
3. In your local terminal, run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/growth-stock-analyser.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up / log in with your GitHub account.
2. Click **New +** $\to$ **Web Service**.
3. Select your `growth-stock-analyser` repository.
4. Render will automatically read the included `Dockerfile` (or `render.yaml`):
   - **Environment**: Docker
   - **Instance Type**: Free
5. Under **Environment Variables**, click **Add Environment Variable**:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `DISCORD_WEBHOOK_URL`: *(Optional: Your Discord channel webhook for daily alerts)*
6. Click **Create Web Service**.
7. In ~2–3 minutes, Render builds the container and gives you a free live URL:
   ```
   https://growth-stock-analyser-xxxx.onrender.com
   ```

### 💡 Pro-Tip: Keep Render Awake 24/7 for Free
Free Render services spin down after 15 minutes of inactivity (taking ~30s to wake up on your next click).
To keep it **permanently awake and instant 24/7**:
1. Go to [cron-job.org](https://cron-job.org) or [uptimerobot.com](https://uptimerobot.com) (both 100% free).
2. Create a free HTTP ping job pointing to:
   ```
   https://growth-stock-analyser-xxxx.onrender.com/api/health
   ```
3. Set the schedule to ping every **10 minutes**.
4. Your server will stay active 24/7, never sleep, and trigger the daily Bursa and US market-close alerts on time!

---

## 🚀 Option 2: Hugging Face Spaces (2 vCPU, 16 GB RAM, Never Sleeps)

Hugging Face Spaces provides 100% free Docker hosting with massive resources (16 GB RAM) and no sleep timeout.

### Step 1: Create a Space
1. Sign up for free at [huggingface.co](https://huggingface.co).
2. Go to [huggingface.co/new-space](https://huggingface.co/new-space).
3. Name your space (e.g. `growth-stock-analyser`).
4. Select:
   - **Space SDK**: Docker $\to$ **Blank**
   - **Space Hardware**: Free CPU (2 vCPU · 16 GB RAM)
   - **Visibility**: Public or Private
5. Click **Create Space**.

### Step 2: Push Your Code
Hugging Face gives you a Git URL for your space:
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/growth-stock-analyser
git push hf main
```
Or simply connect your GitHub repo under **Space Settings** $\to$ **Connect GitHub**.

### Step 3: Add API Secrets
Under **Settings** $\to$ **Variables and secrets**:
- Add secret `GEMINI_API_KEY`
- Add secret `DISCORD_WEBHOOK_URL`

Hugging Face builds your Docker container and your dashboard will be live 24/7 at:
```
https://huggingface.co/spaces/YOUR_USERNAME/growth-stock-analyser
```

---

## ⚡ Option 3: Koyeb Free Eco Tier

1. Sign up at [koyeb.com](https://www.koyeb.com).
2. Click **Create App** $\to$ **GitHub**.
3. Select your repository, choose **Dockerfile**, and set exposed port to `8000`.
4. Deploy for free with zero cold starts at `https://<app>.koyeb.app`.

---

## 🔒 Security & API Keys in the Cloud
- The Google Gemini API key and Discord Webhook URL are injected safely via server environment variables.
- They are never exposed to browser clients or committed to GitHub.

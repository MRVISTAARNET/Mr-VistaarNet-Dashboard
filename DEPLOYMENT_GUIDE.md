# 🚀 Deployment Guide: Forever Free Stack

This guide will help you deploy your application so it runs online 24/7 for free.

**Your Stack:**
*   **Database**: Neon.tech (PostgreSQL)
*   **Backend**: Render (Java Spring Boot)
*   **Frontend**: Netlify (React)

---

## Phase 1: GitHub (Prerequisite)

1.  **Commit & Push**: Ensure all your latest code (including the new `Dockerfile` I just created) is pushed to your GitHub repository.
    ```bash
    git add .
    git commit -m "Ready for deployment"
    git push origin main
    ```

---

## Phase 2: Database (Neon.tech)

1.  Go to [Neon.tech](https://neon.tech/) and Sign Up.
2.  Create a **New Project**.
    *   **Name**: `hrms-db`
    *   **Region**: Singapore (or nearest to you).
3.  The dashboard will show you a **Connection String** (it looks like `postgres://alex:password@...`).
    *   **Copy this string**. You will need it for the Backend.

---

## Phase 3: Backend (Render)

1.  Go to [Render.com](https://render.com/) and Sign Up.
2.  Click **New +** -> **Web Service**.
3.  Connect your **GitHub Repository**.
4.  **Configuration**:
    *   **Name**: `hrms-backend`
    *   **Runtime**: **Docker** (This is crucial! It will use the file I just made).
    *   **Region**: Singapore (Same as DB is best).
    *   **Branch**: `main`
    *   **Plan**: Free.
5.  **Environment Variables** (Scroll down to "Advanced"):
    *   Click **Add Environment Variable**.
    *   **Key**: `SPRING_DATASOURCE_URL`
    *   **Value**: `jdbc:postgresql://<YOUR_NEON_HOST>/<DB_NAME>?sslmode=require`
        *   *Tip: Take the Neon URL you copied. Replace `postgres://` with `jdbc:postgresql://`.*
    *   **Key**: `SPRING_DATASOURCE_USERNAME`
    *   **Value**: (User from Neon, usually inside the URL)
    *   **Key**: `SPRING_DATASOURCE_PASSWORD`
    *   **Value**: (Password from Neon)
    *   **Key**: `APP_MASTER_EMAIL`
    *   **Value**: `mrvistaar@gmail.com`
    *   **Key**: `APP_MASTER_PASSWORD`
    *   **Value**: `your_strong_password_here`
6.  Click **Create Web Service**.
7.  **Wait**: It will take 5-10 minutes to build. Once it says "Live", copy the **Service URL** (e.g., `https://hrms-backend.onrender.com`).

---

## Phase 4: Frontend (Netlify)

1.  Go to [Netlify.com](https://www.netlify.com/) and Sign Up.
2.  Click **Add new site** -> **Import from Git**.
3.  Choose **GitHub** and select your repo `MrVistaarNetDashboard`.
4.  **Build Settings**:
    *   **Base directory**: `nova-forge` (IMPORTANT! Because your frontend is in a subfolder).
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
5.  **Environment Variables**:
    *   Click "Add environment variable".
    *   **Key**: `VITE_API_URL`
    *   **Value**: Your Render Backend URL (e.g., `https://hrms-backend.onrender.com`).
        *   *Note: No trailing slash `/` at the end.*
6.  Click **Deploy site**.

---

## Phase 5: Final Check

1.  Open your Netlify URL (e.g., `https://peaceful-site.netlify.app`).
2.  Try logging in with `mrvistaar@gmail.com`.
    *   *Note*: The first login might be slow because the Render server is waking up.
3.  Create an employee.
4.  Check the "Employee Directory" to confirm data is saving to Neon.

**You are live!** 

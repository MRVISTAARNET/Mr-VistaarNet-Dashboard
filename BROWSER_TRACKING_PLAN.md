# 🕵️‍♂️ Implementation Plan: Employee Browser Activity Tracker

## 1. Technical Reality Check (Crucial)
You asked to "add a browser inside the dashboard".
*   **The Problem**: Modern websites (Google, LinkedIn, etc.) **block** themselves from being loaded inside another website (using `X-Frame-Options: SAMEORIGIN`). Even if they load, **you cannot track** what buttons they click or how long they spend because of browser security rules (CORS).
*   **The Solution**: We must build a **Custom Chrome Extension**.
    *   Employees install this small "Company Tracker" extension on their Chrome browser.
    *   The extension runs in the background, tracking tabs and time.
    *   It silently sends this data to your `hrms-backend`.
    *   Your Dashboard then displays these reports.

---

## 2. Architecture Overview

### A. The Chrome Extension (Client Side)
*   **Manifest V3**: Modern extension standard.
*   **Permissions**: `tabs`, `storage`, `idle`.
*   **Logic**:
    *   Detects when the active tab changes.
    *   Detects when the user is "idle" (mouse not moving for 5 mins) so you don't track breaks as work.
    *   sends data to `POST https://your-backend.onrender.com/api/activity/log`.

### B. The Backend (`hrms-backend`)
*   **New Entity**: `ActivityLog`
    *   `Long id`
    *   `Long employeeId`
    *   `String url` (e.g., "linkedin.com")
    *   `String pageTitle` (e.g., "Recruiter Profile - John Doe")
    *   `LocalDateTime startTime`
    *   `Long durationSeconds`
*   **API Endpoint**:
    *   `POST /api/activity/log` (Secured with Employee Token)
    *   `GET /api/activity/summary/{employeeId}` (For Admin Dashboard)

### C. The Dashboard (Admin View)
*   **New Page**: **"Work Tracker"**
*   **Features**:
    *   **Live View**: "Currently viewing..."
    *   **Pie Chart**: Time distribution (e.g., 40% Gmail, 30% Internal Tools, 30% YouTube).
    *   **Flagging**: Highlight "Non-Work" sites like Netflix or Facebook in red.

---

## 3. Step-by-Step Implementation Guide

### Step 1: Backend Preparation (Spring Boot)
1.  Create `ActivityLog.java` (Model).
2.  Create `ActivityRepository.java`.
3.  Create `ActivityController.java` with the endpoint to accept JSON data from the extension.

### Step 2: Build the Extension
1.  Create a folder `nova-tracker-extension`.
2.  `manifest.json`: Defines the "VistaarNet Tracker".
3.  `background.js`: The script that listeners for `chrome.tabs.onUpdated`.
4.  `popup.html`: A small popup showing the user "Tracking Active: 02:30 hrs today".

### Step 3: Integrate & Deploy
1.  **Distribute**: You create a `.zip` file of the extension.
2.  **Install**: Setup a policy or ask employees to enable "Developer Mode" and "Load Unpacked" to install it.
3.  **Login**: The extension will need the employee to login once (or use a generated API Key from their profile) to link data to their account.

---

## 4. Pros & Cons

| Feature | Embedded Browser (Iframe) | Chrome Extension (Recommended) |
| :--- | :--- | :--- |
| **Works on All Sites?** | ❌ No (Most block it) | ✅ Yes (Tracks everything) |
| **Tracking Accuracy** | 🌑 Zero (Security blocks it) | 🎯 High (Metadata + Time) |
| **Setup Difficulty** | 🟢 Easy | 🟡 Medium (Requires Install) |
| **Privacy/Legal** | ⚠️ Low Risk | ⚠️ **High Risk** (Must notify employees) |

**Recommendation**: Proceed with **Option B (Chrome Extension)**. It is the only way to get the data you want.

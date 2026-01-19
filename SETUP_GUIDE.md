# System Setup and Deployment Guide

This guide provides step-by-step instructions to set up the **MrVistaarNetDashboard** application, containing the `nova-forge` frontend and `hrms-backend`.

## 1. Frontend Setup (VS Code)

**Goal**: Open and run the React frontend.

1.  **Open VS Code**.
2.  **File** > **Open Folder...**
3.  Navigate to and select: `c:\Users\Admin\Desktop\MrVistaarNetDashboard\nova-forge`
4.  Open a **New Terminal** in VS Code (`Ctrl + ~`).
5.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```
6.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
7.  Access the app at the URL shown in the terminal (usually `http://localhost:5173`).

---

## 2. Backend Setup (IntelliJ IDEA)

**Goal**: Open and run the Spring Boot backend.

1.  **Open IntelliJ IDEA**.
2.  **File** > **Open...**
3.  Navigate to: `c:\Users\Admin\Desktop\MrVistaarNetDashboard\hrms-backend`
4.  **Important**: Select the `pom.xml` file or the `hrms-backend` folder and choose **Open as Project**.
5.  Wait for IntelliJ to index and download dependencies.
    *   *Note: If you don't have Maven installed globally, IntelliJ will use the bundled Maven wrapper automatically.*
6.  **Run the Application**:
    *   Locate `src/main/java/com/hrms/hrmsbackend/HrmsBackendApplication.java`.
    *   Right-click the file and select **Run 'HrmsBackendApplication'**.
7.  The backend will start on `http://localhost:8080`.

---

## 3. Database Setup (Real Use)

You have two options for the database. The system is currently configured for **Option A (H2 In-Memory)**, which is easiest for testing. For **real production-like use**, choose **Option B (MySQL)**.

### Option A: H2 Database (Current / Fast Testing)
*Data is lost when the backend stops.*

1.  **Ensure Backend is Running**.
2.  Open your browser to: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
3.  **Login Details**:
    *   **Driver Class**: `org.h2.Driver`
    *   **JDBC URL**: `jdbc:h2:mem:testdb`
    *   **User Name**: `sa`
    *   **Password**: *(Leave Empty)*
4.  Click **Connect**. You can run SQL queries here.
    *   *Note: SQL Workbench cannot easily connect to this "mem" (in-memory) database externally. Use the browser console.*

### Option B: MySQL Database (Recommended for "Real Use")
*Data persists forever. Requires MySQL Server installed.*

1.  **Install MySQL Workbench & Server** (if not installed).
2.  **Create a Database**:
    *   Open MySQL Workbench.
    *   Run query: `CREATE DATABASE hrms_db;`
3.  **Update Backend Configuration**:
    *   Open `hrms-backend/src/main/resources/application.properties` in IntelliJ.
    *   **Comment out** the H2 entries (lines 4-10).
    *   **Uncomment** the MySQL entries (lines 13-18).
    *   **Update Password**: Change `spring.datasource.password=YOUR_PASSWORD_HERE` to your actual MySQL root password.
4.  **Restart Backend**.
5.  **Connect SQL Workbench**:
    *   **Hostname**: `localhost`
    *   **Port**: `3306`
    *   **Username**: `root`
    *   **Default Schema**: `hrms_db`

---

## 4. Verification Checklist

- [ ] **Frontend**: Loads in browser, Login page appears.
- [ ] **Backend**: Console says "Started HrmsBackendApplication".
- [ ] **Connection**: Logging in on Frontend works (Backend validates credentials).

> [!TIP]
> **Default Admin Credentials** (found in `application.properties`):
> *   **Email**: `amrvickyy@gmail.com`
> *   **Password**: `admin123`

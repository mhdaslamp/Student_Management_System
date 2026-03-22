# Project Overview: Student Management System

This document provides a clear explanation of the project structure and code for the **Student Management System**. The project is built using the **MERN Stack** (MongoDB, Express, React, Node.js).

## 1. High-Level Structure

The project is divided into two main folders:

*   **`backend/`**: The server-side code. This handles the business logic, connects to the database, and processes data. It provides "API endpoints" that the frontend talks to.
*   **`frontend/`**: The client-side code (what the user sees). It runs in the browser and interacts with the user.

---

## 2. Backend Structure (`/backend`)

The backend is built with **Node.js** and **Express**.

### Key Folders
*   **`controllers/`**: Contains the "brain" of specific features. Functions here handle the requests (e.g., "log this user in", "get student details").
    *   *Example:* `auth.js` handles login logic.
*   **`models/`**: Defines the structure of data in the database (MongoDB schemas).
    *   *Example:* `User.js` defines what a "User" looks like (name, email, role, etc.).
*   **`routes/`**: Defines the URL paths (API endpoints) for the application.
    *   *Example:* `student.js` defines paths like `/me` (get my profile).
*   **`middleware/`**: Functions that run *before* the main controller logic.
    *   *Example:* `auth.js` checks if a user is logged in before letting them access a protected route.
*   **`data/`**: Stores database files when using the embedded database.
*   **`uploads/`**: Stores files uploaded by users.

### Key Files
*   **`server.js`**: **The Entry Point**. This file starts the server, connects to the database, and sets up all the routes.
*   **`package.json`**: Lists all the libraries ("dependencies") the backend project needs (like `express`, `mongoose`, `jsonwebtoken`).

---

## 3. Frontend Structure (`/frontend`)

The frontend is built with **React** and **Vite** (a tool to build React apps quickly).

### Key Folders (`/frontend/src`)
*   **`pages/`**: Contains the main views of the application (e.g., Login page, Admin Dashboard, Student Dashboard).
*   **`components/`**: Reusable building blocks (e.g., Buttons, Navigation bars) that can be used on multiple pages.
*   **`context/`**: Manages global state, specifically **Authentication** (keeping track of the logged-in user).
*   **`api/`**: Functions to talk to the backend API.

### Key Files
*   **`App.jsx`**: **The Main Component**. It handles **Routing**—deciding which page to show based on the URL (e.g., if URL is `/login`, show `Login` component).
*   **`main.jsx`**: The starting point that loads `App.jsx` into the web page.

---

## 4. Important Code Portions Explained

### A. Server Setup (`backend/server.js`)
This code initializes the server.
```javascript
// Connects to the database
connectDB();

// Sets up "routes" - telling the server where to send different requests
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
```
*   **Why it's important:** It's the central hub that wires everything together.

### B. Authentication (`backend/controllers/auth.js`)
This file handles how users log in.
```javascript
exports.login = async (req, res) => {
    // ... checks if email OR admissionNo is provided
    if (email) {
        user = await User.findOne({ email }); // Login for Admin/Teacher
    } else if (admissionNo) {
        user = await User.findOne({ admissionNo }); // Login for Student
    }
    // ... validates password and sends back a "token"
}
```
*   **Why it's meaningful:** It allows different types of users (Staff vs. Students) to log in using different methods (Email vs. Admission Number).

### C. Frontend Routing (`frontend/src/App.jsx`)
This file controls navigation.
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  
  {/* Protected Routes: Only specific roles can access these */}
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route path="/admin/*" element={<AdminDashboard />} />
  </Route>
</Routes>
```
*   **Why it's meaningful:** It ensures security on the frontend. An "admin" page is only accessible if the user has the "admin" role.

### D. Protected Routes (`backend/routes/student.js`)
```javascript
// The auth('student') middleware ensures only students can access this
router.get('/me', auth('student'), studentController.getMe);
```
*   **Why it's meaningful:** This is the backend security layer. Even if someone tries to force a request to `/api/student/me`, the server will reject it if they aren't logged in as a student.

# Student Management System

A comprehensive web-based application for managing student academic records, university/internal results, requests, and administrative tasks. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this system provides distinct, secure portals for Students, Teachers, and Administrators.

## 🚀 Features

-   **Role-Based Access Control:** Secure login and customized dashboards for Admin, Teachers (Principal, HOD, Tutor, Professor), and Students.
-   **Student Portal:**
    -   View personal profile and academic details.
    -   Check semester-wise University and Internal results with SGPA and credit breakdown.
    -   Raise and track administrative or academic requests.
-   **Teacher/HOD/Principal Portal:**
    -   Manage and oversee student batches (HODs can view active batches).
    -   View student results and analytics.
    -   Handle Internal Results and approve/manage student requests.
-   **Admin Portal (Includes Exam Controller duties):**
    -   Manage users (Students, Staff) and system settings.
    -   Upload official University result PDFs which are automatically parsed.
    -   Review drafts and publish University results to teachers and students.
    -   Generate detailed Excel reports including Pass/Fail analysis and Topper lists.
-   **Result Processing & Analytics:**
    -   Automated PDF parsing for university results (`pdf-parse`).
    -   Accurate SGPA calculation based on credit schemes (supports both 2019 and 2024 schemes).
    -   Advanced result analytics (includes LET students, excludes supply students from core analytics).

## 🛠️ Tech Stack

-   **Frontend:** React.js, Tailwind CSS, Vite, Lucide React (Icons).
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (with Mongoose).
-   **Tools:** `pdf-parse` (PDF extraction), `exceljs` (Excel generation).

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas URL)
-   [Git](https://git-scm.com/)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mhdaslamp/Student_Management_System.git
cd Student_Management_System
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory with the following content:

```env
NODE_ENV=development # Set to 'production' for production builds
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_db  # Use MongoDB Atlas URI for production
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**Start the Server:**

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend` directory with the following content:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start the Frontend:**

```bash
npm run dev
```

The application will run on `http://localhost:5173`.

## 📖 Usage Guide

1.  **Login:** Open the frontend URL.
    -   **Admin:** Use admin credentials to manage staff/students and upload/publish university results.
    -   **Teacher/Staff:** Login to manage batches, handle internal results, view analytics, and manage student requests.
    -   **Student:** Login to view results, check profile, and make requests.
2.  **Upload Results (Admin):**
    -   Go to the KTU Results section.
    -   Upload the official University Result PDF.
    -   Review the parsed draft and click **Publish** to release the results.

## 📂 Project Structure

```text
Student Management System/
├── backend/                # Node.js/Express API (Modularized)
│   ├── controllers/        # Request handlers (Admin, Student, Staff, Auth, etc.)
│   ├── models/             # Mongoose schemas (User, Result, Request, Batch, etc.)
│   ├── routes/             # API routes
│   ├── utils/              # Helpers (resultProcessor.js, pdf parsing)
│   ├── credits_2019.json   # 2019 Credit scheme configuration
│   └── credits_2024.json   # 2024 Credit scheme configuration
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Dashboard, Login, Results, Requests)
│   │   ├── context/        # React Context (Auth)
│   │   └── api/            # Axios API layer setup
└── README.md               # Project Documentation
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.

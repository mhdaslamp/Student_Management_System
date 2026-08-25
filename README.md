# Student Management System

A comprehensive web-based application for managing student academic records, results, and administrative tasks. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this system provides distinct portals for Students, Teachers, and Administrators.

## 🚀 Features

-   **Role-Based Access Control:** Secure login and dashboards for Admin, Teachers, and Students.
-   **Student Portal:**
    -   View personal profile and academic details.
    -   Check semester-wise results with SGPA and credit breakdown.
    -   View assigned tasks and coursework.
-   **Teacher Portal:**
    -   Manage student batches.
    -   Upload result PDFs (University format) which are automatically parsed.
    -   Automatic SGPA calculation and Excel report generation.
    -   Create and manage assignments.
-   **Admin Portal:**
    -   Manage users (Students, Teachers) and system settings.
-   **Result Processing:**
    -   Automated PDF parsing for university results.
    -   Calculation of SGPA based on credit schemes (supports 2019 and 2024 schemes).
    -   Generation of detailed Excel reports including Pass/Fail analysis and Topper lists.

## 🛠️ Tech Stack

-   **Frontend:** React.js, Tailwind CSS, Vite, Lucide React (Icons).
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (with Mongoose).
-   **Tools:** `pdf-parse` (PDF extraction), `exceljs` (Excel generation), `nodemon`.

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

**Start the Frontend:**

```bash
npm run dev
```

The application will likely run on `http://localhost:5173` (Vite default).

## 📖 Usage Guide

1.  **Login:** Open the frontend URL.
    -   **Admin:** Use admin credentials.
    -   **Exam Controller:** Login to upload university results and publish them.
    -   **Teacher:** Login to manage batches, handle internal results, and view university results.
    -   **Student:** Login to view results, profile, and make requests.
2.  **Upload Results (Exam Controller):**
    -   Go to the University Results section.
    -   Upload the official University Result PDF.
    -   Review the draft and click **Publish** to release the results to teachers and students.

## 📂 Project Structure

```
Student Management System/
├── backend/                # Node.js/Express API
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas (User, Result, Batch, etc.)
│   ├── routes/             # API routes
│   ├── utils/              # Helpers (resultProcessor.js, pdf parsing)
│   ├── credits_2019.json   # Credit scheme configuration
│   └── credits_2024.json   # Credit scheme configuration
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (Dashboard, Login, Results)
│   │   ├── context/        # React Context (Auth)
│   │   └── api/            # Axios setup
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

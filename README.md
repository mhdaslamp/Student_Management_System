# 🎓 Student Management System (SMS)

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-purple.svg)](https://vitejs.dev/)

A premium, full-stack Student Management System designed for modern educational institutions. This system streamlines academic record-keeping, automated result processing, and student-staff communication workflows.

---

## ✨ Key Highlights

-   📄 **Automated Result Parsing:** Intelligent PDF parsing for university results with automatic SGPA calculation for both **2019 and 2024 schemes**.
-   📊 **Excel Intelligence:** Generates detailed analysis reports in Excel, including Pass/Fail statistics and Topper lists.
-   📑 **Verified Request System:** Students can submit requests with attachments, which are tracked and verified via **QR Codes**.
-   🔐 **Role-Based Security:** Distinct, secure portals for Students, Teachers, HODs, Principals, and Admins.

---

## 🛠️ Tech Stack

-   **Frontend:** React.js (Vite), Tailwind CSS, Lucide React (Icons), Axios.
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (via Mongoose).
-   **Utilities:** `pdf-parse` (Extraction), `exceljs` (Report Generation), `bcryptjs` (Security), `jsonwebtoken` (Auth).

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/try/download/community)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/mhdaslamp/Student_Management_System.git
cd Student_Management_System

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Running the Application

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📖 Feature Portals

### 👨‍🎓 Student Portal
-   **Profile Management:** View personal and academic details.
-   **Academic Progress:** Check semester-wise results and SGPA breakdown.
-   **Request System:** Option to write and track official requests with file attachments.
-   **Verification:** Download PDF versions of requests with unique QR verification.

### 👩‍🏫 Teacher & Staff Portal
-   **Batch Management:** Organize and manage student groups.
-   **Result Processing:** Upload University Result PDFs for automated processing.
-   **Auto-Analysis:** Download Excel reports comparing student performances.
-   **Approval Workflow:** Review student requests (Approve/Reject/Revert).

### ⚙️ Admin Portal
-   **User Control:** Manage staff and student accounts.
-   **System Settings:** Configure academic schemes and global parameters.

---

## 📂 Project Structure

```text
Student Management System/
├── backend/                # Express API & Business Logic
│   ├── controllers/        # Logical handlers for routes
│   ├── models/             # Mongoose schemas (User, Result, Request, etc.)
│   ├── routes/             # API Endpoint definitions
│   ├── utils/              # PDF Parsing & Excel Generation logic
│   ├── data/               # Persistent embedded database storage
│   └── uploads/            # Student attachments & documents
├── frontend/               # React (Vite) Application
│   ├── src/
│   │   ├── pages/          # Full page views (Dashboard, Login)
│   │   ├── components/     # UI building blocks
│   │   └── context/        # Global Auth & State management
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.

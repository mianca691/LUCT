# 🎓 LUCT Reporting System

> A clean **PERN stack** web-based reporting application for **Limkokwing University** faculty.  
> Features **role-based access** (Student, Lecturer, PRL, PL), lecturer reporting forms, monitoring, and reporting modules — built with **scalable architecture** and **CI/CD integration**.

---

## 🚀 Overview

The **LUCT Reporting System** streamlines the workflow of academic reporting, class monitoring, and performance tracking across multiple roles within Limkokwing University.  
It provides a secure, modular, and user-friendly platform for lecturers and administrators to manage reports and performance logs efficiently.

### ✨ Key Features

- **🔐 Role-Based Access Control**
  - Supports Student, Lecturer, PRL, and PL roles.
  - Each role has dedicated dashboards and privileges.
- **🧾 Lecturer Reporting Forms**
  - Simplified, digital submission of reports.
- **📊 Reporting & Monitoring Modules**
  - PRL and PL users can track class performance, student engagement, and lecturer submissions.
- **⚙️ Scalable Architecture**
  - Modular structure separating concerns between API, services, and UI.
- **☁️ CI/CD Integration**
  - Ready for deployment with automatic build and testing pipelines.
- **🧠 Modern Stack**
  - React (Vite) + Node.js (Express) + PostgreSQL + JWT Auth.

---

## 🏗️ Tech Stack

| Layer | Technology | Description |
|:------|:------------|:-------------|
| Frontend | **React + Vite** | Modern, fast, and modular UI |
| Backend | **Node.js + Express.js** | REST API and authentication |
| Database | **PostgreSQL** | Relational data storage |
| Auth | **JWT (JSON Web Tokens)** | Secure token-based authentication |
| Styling | **Tailwind CSS + ShadCN/UI** | Clean and responsive UI components |
| Dev Tools | **ESLint, Prettier, Nodemon** | Developer experience and consistency |
| Deployment | **Render** | Cloud-ready CI/CD deployment |

---

## 📂 Folder Structure

LUCT/
├── client/ # React frontend (Vite)
│ ├── src/
│ │ ├── pages/ # Page-level components by role
│ │ ├── components/ # Reusable UI components
│ │ ├── contexts/ # Auth & global state providers
│ │ ├── services/ # API integration layer
│ │ ├── routes/ # App routing logic
│ │ └── App.jsx # Root React component
│ └── vite.config.js
│
├── server/ # Express backend
│ ├── src/
│ │ ├── controllers/ # Route logic
│ │ ├── routes/ # Express routes
│ │ ├── models/ # PostgreSQL models / queries
│ │ ├── middleware/ # Auth & validation
│ │ └── config/ # Database and env setup
│ ├── index.js # Server entry point
│ └── package.json
│
├── .env.example # Sample environment variables
├── docker-compose.yml # Optional Docker setup
├── README.md
└── package.json

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Whizz75/luct-reporting-app.git
cd luct-reporting-app
2️⃣ Backend Setup
bash
Copy code
cd server
npm install
Create a .env file inside the /server directory:

PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/luct_db
JWT_SECRET=your_jwt_secret
Run migrations or seed scripts (if applicable):

npm run migrate
npm run seed
Start the backend server:

npm run dev
3️⃣ Frontend Setup

cd ../client
npm install
npm run dev
Frontend will typically run at:
👉 http://localhost:5173

Backend will typically run at:
👉 http://localhost:5000

🔑 Environment Variables
Variable	Description	Example
DATABASE_URL	PostgreSQL connection string	postgres://user:pass@localhost:5432/luct_db
JWT_SECRET	Secret key for token signing	mystrongsecret
PORT	Express server port	5000
VITE_API_URL	Frontend base API URL	http://localhost:5000/api

🧩 Available Scripts
Client
Command	Description
npm run dev	Start local development server
npm run build	Build for production
npm run preview	Preview production build

Server
Command	Description
npm run dev	Start development server (nodemon)
npm start	Run production server
npm test	Run Jest test suite

🧱 Architecture Overview
The app follows a modular PERN architecture:

Frontend — React app with protected routes and role-based dashboards.

Backend — RESTful API with layered controllers, services, and database models.

Database — Normalized PostgreSQL schema for users, classes, and reports.

Auth — JSON Web Tokens (JWT) + context-based state management.

🧪 Testing
Run all backend tests with:

cd server
npm run test
Uses Jest and Supertest for route and model testing.

🚀 Deployment
The app supports containerized or cloud deployment.

🐳 Using Docker

docker-compose up --build
☁️ Using CI/CD ( Render )
Push to the main branch → triggers auto-build and deployment.

Ensure environment variables are set in the hosting dashboard.

👥 Roles Overview
Role	Description
Student	Views enrolled classes and submission status
Lecturer	Submits reports for assigned classes
PRL (Program Leader)	Monitors lecturer submissions and performance
PL (Programme Leader)	Reviews and finalizes reports across programs

🧭 Roadmap
 Add analytics dashboard for PRL/PL

 Enable email notifications

 Add PDF export of reports

 Integrate SSO with university portal

🤝 Contributing
Fork the repo

Create your feature branch: git checkout -b feature/awesome-feature

Commit your changes: git commit -m "Add awesome feature"

Push to the branch: git push origin feature/awesome-feature

Create a Pull Request

🧑‍💻 Authors
Developed by LUCT Tech Team
Faculty of Computing & Technology
Limkokwing University of Creative Technology

🪪 License
This project is licensed under the MIT License.
See LICENSE for details.

“Empowering education through digital innovation.” 🌍

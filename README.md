# CareerFlux — Open Job Portal

A production-ready full-stack MERN job portal with role-based dashboards for **Job Seekers**, **Employers**, and **Admins**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| File Upload | Multer (PDF) |
| Security | Helmet, CORS, Rate Limiting |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### 1. Backend Setup

```bash
cd CareerFlux/02_Backend
cp .env.example .env    # Edit with your MongoDB URI & JWT secret
npm install
npm run dev             # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd CareerFlux/01_Frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

### Environment Variables (Backend `.env`)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/careerflux
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Features

### Job Seeker
- Register/Login, edit profile, upload PDF resume
- Browse & search jobs with filters (type, category, level, location)
- Apply for jobs with cover letter, track application status

### Employer
- Post job listings with full details (salary, skills, requirements)
- View applicants per job, update application status
- Employer dashboard with job analytics

### Admin
- Platform stats (users, jobs, applications)
- Manage users (activate/deactivate/delete)
- Manage job postings

## API Endpoints

| Route | Description |
|-------|------------|
| `POST /api/auth/register` | Register user |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Get current user |
| `GET /api/jobs` | Browse jobs |
| `POST /api/jobs` | Create job (employer) |
| `POST /api/applications` | Apply for job |
| `GET /api/applications/my` | My applications |
| `POST /api/resumes/upload` | Upload resume PDF |
| `GET /api/admin/stats` | Platform stats |

## Deployment

### Frontend → Vercel
1. Import the `01_Frontend` directory to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render
1. Create new Web Service with `02_Backend` directory
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all `.env` variables in Render dashboard

## Project Structure

```
CareerFlux/
├── 01_Frontend/             # React + Vite
│   └── src/
│       ├── components/      # Navbar, Footer, JobCard, etc.
│       ├── context/         # AuthContext
│       ├── pages/           # Home, Login, Register, Jobs
│       │   ├── dashboard/   # Seeker, Employer, Admin
│       │   └── employer/    # PostJob, ViewApplicants
│       ├── services/        # API client (axios)
│       ├── App.jsx          # Router
│       └── main.jsx         # Entry point
│
└── 02_Backend/              # Node + Express
    ├── config/              # Multer config
    ├── controllers/         # Auth, Job, Application, Resume, Admin
    ├── middleware/           # Auth, Validate, Rate Limiter
    ├── models/              # User, Job, Application, Resume
    ├── routes/              # Auth, Jobs, Applications, Resumes, Admin
    ├── utils/               # JWT, Response helpers
    └── server.js            # Express app entry
```

## License

ISC

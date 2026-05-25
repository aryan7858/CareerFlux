# CareerFlux Backend API

A production-ready **Node.js + Express + MongoDB** backend for the CareerFlux open job portal, featuring full **JWT Authentication**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and set your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/careerflux
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 📁 Project Structure

```
careerflux-backend/
├── server.js                  # Entry point
├── .env.example               # Environment template
├── package.json
│
├── models/
│   └── User.js                # Mongoose User schema
│
├── controllers/
│   └── authController.js      # All auth business logic
│
├── routes/
│   └── auth.js                # Auth route definitions
│
├── middleware/
│   ├── auth.js                # JWT protect + authorize
│   ├── validate.js            # express-validator rules
│   └── rateLimiter.js         # In-memory rate limiting
│
└── utils/
    ├── jwt.js                 # Token generation/verification
    └── response.js            # Standardised API responses
```

---

## 🔐 Auth API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Private | Get own profile |
| PUT | `/api/auth/me` | Private | Update profile |
| PUT | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/forgot-password` | Public | Request reset link |
| POST | `/api/auth/reset-password/:token` | Public | Reset with token |
| DELETE | `/api/auth/me` | Private | Delete account |
| GET | `/api/health` | Public | Health check |

---

## 📨 Request & Response Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "role": "jobseeker"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGci...",
  "user": { "id": "...", "firstName": "Jane", "role": "jobseeker", ... }
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

---

### Protected Route (send JWT in header)
```http
GET /api/auth/me
Authorization: Bearer eyJhbGci...
```

---

## 👤 User Roles

| Role | Description |
|------|-------------|
| `jobseeker` | Default. Can apply to jobs, manage profile. |
| `employer` | Can post jobs, view applications, employer dashboard. |
| `admin` | Full platform access. |

---

## 🔒 Security Features

- **Passwords** hashed with bcryptjs (salt rounds: 12)
- **JWT** signed with secret, expires in 7 days
- **Rate limiting** on auth endpoints (10 req/15 min; 5 req/hr for sensitive routes)
- **Input validation** via express-validator on all routes
- **Password fields** excluded from all query results (`select: false`)
- **Safe public profile** via `user.toPublicJSON()` — strips all sensitive fields
- **Password reset tokens** are SHA-256 hashed before storage

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM / schema validation |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation & verification |
| express-validator | Input sanitization & validation |
| dotenv | Environment variable management |
| cors | Cross-Origin Resource Sharing |

---

## 📈 Coming Next

To extend this backend, add:
- `models/Job.js` — Job listings
- `models/Application.js` — Job applications
- `routes/jobs.js` — CRUD for job postings
- `routes/applications.js` — Apply / manage applications
- Email service (Nodemailer/SendGrid) for verification & reset emails
- File uploads (Multer + S3) for resumes and company logos

---

## 📝 License
MIT © CareerFlux

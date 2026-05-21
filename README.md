# AI Travel Itinerary Generator 🌍✈️

A production-ready full-stack MERN application that automatically extracts travel booking information from uploaded documents using OCR, and generates comprehensive AI-powered travel itineraries using Google Gemini AI.

## 🚀 Features

- **Smart Document Upload** — Drag & drop PDF, PNG, JPG, WEBP travel documents
- **AI-Powered OCR** — Automatically extracts passenger names, flight numbers, hotel details, dates
- **Gemini AI Itinerary** — Day-by-day plans, attractions, food, packing lists, budgets
- **Interactive Dashboard** — Stats, recent itineraries, travel history
- **Share & Export** — Public share links, QR codes, PDF download, WhatsApp/Email sharing
- **AI Travel Chatbot** — Ask questions about your itinerary
- **Favorites & Search** — Save and filter your travel plans
- **Fully Responsive** — Mobile-first design with dark mode

---

## 📁 Folder Structure

```
assesment/
├── server/                  # Node.js + Express Backend
│   ├── index.js             # App entry point
│   ├── .env                 # Environment variables
│   ├── uploads/             # Uploaded files storage
│   └── src/
│       ├── config/          # DB & Logger config
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, upload, rate limit, error
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # OCR & AI services
│       ├── utils/           # Helpers & response formatters
│       └── validators/      # Input validators
│
└── client/                  # React + Vite Frontend
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── api/             # Axios API modules
        ├── components/      # Reusable components
        │   ├── layout/      # Sidebar, Navbar
        │   └── features/    # Feature components
        ├── context/         # Auth & Theme context
        ├── pages/           # Route pages
        └── utils/           # Date utils, helpers
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd assesment
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ai-travel
JWT_SECRET=your_super_secure_secret_min_32_chars
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AI Travel Planner
```

Start the frontend:
```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload documents (multipart) |
| GET | `/api/upload` | Get user's documents |
| DELETE | `/api/upload/:id` | Delete document |

### OCR Extraction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/extract/:documentId` | Extract from single document |
| POST | `/api/ocr/extract-batch` | Extract from multiple documents |
| PUT | `/api/ocr/:documentId` | Update extracted data manually |

### Itinerary
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/itinerary/generate` | Generate AI itinerary |
| GET | `/api/itinerary` | Get all itineraries |
| GET | `/api/itinerary/:id` | Get single itinerary |
| PUT | `/api/itinerary/:id` | Update itinerary |
| DELETE | `/api/itinerary/:id` | Delete itinerary |
| PATCH | `/api/itinerary/:id/favorite` | Toggle favorite |
| POST | `/api/itinerary/:id/regenerate` | Regenerate with AI |
| POST | `/api/itinerary/:id/chat` | Chat with AI about trip |
| GET | `/api/itinerary/stats` | Get user stats |

### Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/share/:token` | View public itinerary (no auth) |
| POST | `/api/share/:id/create` | Create share link |
| DELETE | `/api/share/:id/revoke` | Revoke share link |
| GET | `/api/share/:id/qr` | Generate QR code |

---

## 🔧 Environment Variables

### Backend (`server/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGODB_URI` | MongoDB connection string | **Yes** |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | **Yes** |
| `JWT_EXPIRE` | Token expiry (e.g., `7d`) | No |
| `GEMINI_API_KEY` | Google Gemini API key | **Yes** |
| `CLIENT_URL` | Frontend URL for CORS | No |

### Frontend (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_APP_NAME` | App display name |

---

## 🚀 Deployment

### Frontend (Vercel/Netlify / Render Static Site)
1. Set `VITE_API_URL` to your backend URL (e.g. `https://your-api.onrender.com/api`)
2. Build command: `npm run build`
3. Output directory: `dist`

### Frontend on Render (Web Service)
Use these settings so Render can detect an open port:

| Setting | Value |
|--------|--------|
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Do not use** | `npm run dev` (binds to localhost only) |

Add `VITE_API_URL` in the Render environment variables. The app serves the production build via `vite preview` on `0.0.0.0` and `process.env.PORT`.

**Tip:** For a React SPA, Render **Static Site** (not Web Service) is usually simpler: same build command, publish `dist`, no start command needed.

### Backend (Render/Railway)
1. **Root Directory:** `server` (not the repo root or `client`)
2. **Build command:** `npm install`
3. **Start command:** `npm start` (do not use `npm run dev`)
4. Set environment variables in the dashboard (do not commit `.env`). Render sets `PORT` automatically — do not hardcode it unless you know what you're doing.
5. Ensure `uploads/` directory exists or use cloud storage
6. The API listens on `0.0.0.0` and `process.env.PORT` so Render's health checks can reach it.

---

## 🛡️ Security Features

- JWT authentication with expiry
- Password hashing with bcrypt (12 rounds)
- MongoDB query sanitization (NoSQL injection prevention)
- Rate limiting (auth: 10/15min, uploads: 20/hr, AI: 10/hr)
- Helmet.js security headers
- File type and size validation
- Protected routes middleware

---

## 🤖 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 8, Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Context API + useReducer |
| HTTP | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| OCR | Tesseract.js (images), pdf-parse (PDFs) |
| AI | Google Gemini 1.5 Flash |
| Upload | Multer |
| Logging | Winston |
| QR Code | qrcode |
| PDF Export | jsPDF + html2canvas |

---

## 📝 License

MIT License — Free to use and modify.

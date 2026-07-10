import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import notesRouter from './routes/notes';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests like curl/postman
    if (!origin) return callback(null, true);

    const normalize = (u?: string) => (u ? u.replace(/\/$/, '') : u);
    const normOrigin = normalize(origin as string);
    const normAllowed = allowedOrigins.map(normalize);

    if (normAllowed.includes(normOrigin)) return callback(null, true);

    // allow any localhost/127.0.0.1 origin (different dev ports)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normOrigin || '')) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Root route for quick browser check
app.get('/', (req, res) => res.send('Backend running'));

// Initialize DB then start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });

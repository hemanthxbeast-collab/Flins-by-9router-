import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { issueToken, requireAuth } from './auth.js';
import { executeCommand } from './intent.js';

const credentials = z.object({ email: z.string().email().max(254), password: z.string().min(12).max(128) });
const commandSchema = z.object({ command: z.string().trim().min(1).max(500) });
export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
  app.use(express.json({ limit: '16kb' }));
  app.use(rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a minute.' } } }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.post('/api/auth/register', async (req, res, next) => {
    try { const { email, password } = credentials.parse(req.body); const hash = await bcrypt.hash(password, 12); const result = db.prepare('INSERT INTO users (email,password_hash) VALUES (?,?)').run(email, hash); const user = { id: Number(result.lastInsertRowid), email }; return res.status(201).json({ token: issueToken(user), user }); }
    catch (err) { if (err.code?.startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'An account with that email already exists.' } }); return next(err); }
  });
  app.post('/api/auth/login', async (req, res, next) => {
    try { const { email, password } = credentials.parse(req.body); const user = db.prepare('SELECT * FROM users WHERE email=?').get(email); if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' } }); return res.json({ token: issueToken(user), user: { id: user.id, email: user.email } }); } catch (err) { return next(err); }
  });
  app.post('/api/tasks', requireAuth, (req, res, next) => { try { const { command } = commandSchema.parse(req.body); const task = executeCommand(command); const result = db.prepare('INSERT INTO tasks (user_id,command,intent,status,response,metadata) VALUES (?,?,?,?,?,?)').run(req.user.sub, command, task.intent, task.status, task.response, JSON.stringify(task.metadata)); return res.status(201).json({ task: { id: Number(result.lastInsertRowid), command, ...task, createdAt: new Date().toISOString() } }); } catch (err) { return next(err); } });
  app.get('/api/tasks', requireAuth, (req, res) => { const tasks = db.prepare('SELECT id,command,intent,status,response,metadata,created_at AS createdAt FROM tasks WHERE user_id=? ORDER BY id DESC LIMIT 50').all(req.user.sub).map(t => ({ ...t, metadata: JSON.parse(t.metadata) })); res.json({ tasks }); });
  app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' } }));
  app.use((err, _req, res, _next) => { if (err instanceof z.ZodError) return res.status(400).json({ error: { code: 'INVALID_INPUT', message: err.issues[0]?.message || 'Request data is invalid.' } }); console.error('Unhandled API error', err); return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The service could not complete that request. Please try again.' } }); });
  return app;
}

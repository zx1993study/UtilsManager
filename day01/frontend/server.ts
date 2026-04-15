import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import db from './src/lib/db.ts';
import { generateToken, authenticateToken, authorizeRole, AuthRequest } from './src/lib/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Routes ---
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.cookie('token', token, { 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.json({ user: { id: user.id, username: user.username, role: user.role }, token });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // --- User Management ---
  app.get('/api/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const users = db.prepare('SELECT id, username, role, created_at FROM users').all();
    res.json(users);
  });

  app.post('/api/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role || 'user');
      res.status(201).json({ message: 'User created' });
    } catch (e) {
      res.status(400).json({ message: 'Username already exists' });
    }
  });

  // --- Dictionary Config ---
  app.get('/api/dictionaries', authenticateToken, (req, res) => {
    const dicts = db.prepare('SELECT * FROM dictionaries').all();
    res.json(dicts);
  });

  app.post('/api/dictionaries', authenticateToken, (req, res) => {
    const { key, value, type, description } = req.body;
    db.prepare('INSERT INTO dictionaries (key, value, type, description) VALUES (?, ?, ?, ?)').run(key, value, type, description);
    res.status(201).json({ message: 'Dictionary entry created' });
  });

  // --- Interface Management ---
  app.get('/api/interfaces', authenticateToken, (req, res) => {
    const interfaces = db.prepare('SELECT * FROM interfaces').all();
    res.json(interfaces);
  });

  app.post('/api/interfaces', authenticateToken, (req, res) => {
    const { name, url, method, headers, body, description } = req.body;
    db.prepare('INSERT INTO interfaces (name, url, method, headers, body, description) VALUES (?, ?, ?, ?, ?, ?)').run(
      name, url, method, JSON.stringify(headers), JSON.stringify(body), description
    );
    res.status(201).json({ message: 'Interface created' });
  });

  // --- Workflow Management ---
  app.get('/api/workflows', authenticateToken, (req, res) => {
    const workflows = db.prepare('SELECT * FROM workflows').all();
    res.json(workflows);
  });

  app.post('/api/workflows', authenticateToken, (req, res) => {
    const { name, steps, description } = req.body;
    db.prepare('INSERT INTO workflows (name, steps, description) VALUES (?, ?, ?)').run(name, JSON.stringify(steps), description);
    res.status(201).json({ message: 'Workflow created' });
  });

  // --- Test Reports ---
  app.get('/api/reports', authenticateToken, (req, res) => {
    const reports = db.prepare(`
      SELECT r.*, w.name as workflow_name 
      FROM reports r 
      JOIN workflows w ON r.workflow_id = w.id 
      ORDER BY r.created_at DESC
    `).all();
    res.json(reports);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

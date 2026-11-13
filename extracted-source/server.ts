import express from 'express';
import crypto from 'crypto';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-managed Master Encryption Key (32 bytes for AES-256-GCM)
// Kept strictly on the server and never exposed to the frontend.
const SERVER_SECRET_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY
  ? crypto.createHash('sha256').update(process.env.CREDENTIAL_ENCRYPTION_KEY).digest()
  : crypto.createHash('sha256').update('jay-ambe-data-entry-secure-salt-2026').digest();

/**
 * Encrypt sensitive credentials using AES-256-GCM
 */
app.post('/api/crypto/encrypt', (req, res) => {
  try {
    const { plaintext } = req.body;
    if (typeof plaintext !== 'string') {
      res.status(400).json({ error: 'plaintext string is required' });
      return;
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', SERVER_SECRET_KEY, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    res.json({
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      tag: authTag,
    });
  } catch (err: any) {
    console.error('Encryption error:', err);
    res.status(500).json({ error: 'Failed to encrypt credential' });
  }
});

/**
 * Decrypt sensitive credentials using AES-256-GCM
 */
app.post('/api/crypto/decrypt', (req, res) => {
  try {
    const { ciphertext, iv, tag } = req.body;
    if (!ciphertext || !iv || !tag) {
      res.status(400).json({ error: 'ciphertext, iv, and tag are required' });
      return;
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      SERVER_SECRET_KEY,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    res.json({ plaintext: decrypted });
  } catch (err: any) {
    console.error('Decryption error:', err);
    res.status(400).json({ error: 'Failed to decrypt credential (invalid key or tag)' });
  }
});

/**
 * System Health / Ping endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    // Dynamic import of vite in dev mode
    const { createServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';

    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`JAY AMBE DATA ENTRY APP server listening on http://0.0.0.0:${port}`);
  });
}

startServer();

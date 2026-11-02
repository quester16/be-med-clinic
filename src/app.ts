import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { notFound, handleError } from './common/errors.js';
import { prisma } from './db.js';
import { doctorRoutes } from './modules/doctors/doctors.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.info(JSON.stringify({
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
});

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api/doctors', doctorRoutes);
app.use(notFound);
app.use(handleError);

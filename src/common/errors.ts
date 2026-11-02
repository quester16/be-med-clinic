import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
};

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request.', details: error.issues },
    });
    return;
  }

  console.error(error instanceof Error ? error.message : 'Unknown server error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Server error.' } });
};

import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Planora AI',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.AI_API_KEY,
  });
});

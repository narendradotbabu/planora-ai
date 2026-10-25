import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { planRoutes } from './routes/plan.js';
import { healthRoutes } from './routes/health.js';
import { ideasRoutes } from './routes/ideas.js';
import { budgetRoutes } from './routes/budget.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api', healthRoutes);
app.use('/api', planRoutes);
app.use('/api', ideasRoutes);
app.use('/api', budgetRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`Planora AI server running on port ${PORT}`);
});

export default app;

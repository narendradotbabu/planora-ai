import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { EventContextSchema } from '../schemas/event.js';
import { generatePlan } from '../services/planningEngine.js';
import { isAIConfigured } from '../ai/provider.js';

export const planRoutes = Router();

const planLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20'),
  message: { error: 'Too many requests. Please try again shortly.' },
});

planRoutes.post('/plan', planLimiter, (req, res) => {
  try {
    const parsed = EventContextSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid event data',
        details: parsed.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    const ctx = parsed.data;

    // Use rule-based engine (AI integration would go here)
    const plan = generatePlan(ctx);

    if (isAIConfigured()) {
      // Future: call AI provider and validate response
      // For now, fall through to rule-based
    }

    return res.json(plan);
  } catch (error) {
    console.error('Plan generation error:', error);
    return res.status(500).json({ error: 'Failed to generate plan' });
  }
});

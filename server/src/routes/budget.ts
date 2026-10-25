import { Router } from 'express';
import { BudgetRecommendationRequestSchema } from '../schemas/event.js';
import { generateBudgetRecommendations } from '../services/planningEngine.js';

export const budgetRoutes = Router();

budgetRoutes.post('/budget/recommendations', (req, res) => {
  try {
    const parsed = BudgetRecommendationRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    const { eventContext, currentAllocations } = parsed.data;
    const recommendations = generateBudgetRecommendations(eventContext, currentAllocations);

    return res.json(recommendations);
  } catch (error) {
    console.error('Budget recommendation error:', error);
    return res.status(500).json({ error: 'Failed to generate budget recommendations' });
  }
});

import { Router } from 'express';
import { IdeaRequestSchema } from '../schemas/event.js';
import { generateIdeas } from '../services/planningEngine.js';

export const ideasRoutes = Router();

ideasRoutes.post('/ideas', (req, res) => {
  try {
    const parsed = IdeaRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      });
    }

    const { eventContext, category, preference } = parsed.data;
    const ideas = generateIdeas(eventContext, category, preference);

    return res.json(ideas);
  } catch (error) {
    console.error('Ideas generation error:', error);
    return res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

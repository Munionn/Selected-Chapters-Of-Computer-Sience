import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import Pizza from '../models/Pizza';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all pizzas (public - with search and sort)
router.get('/', [
  query('search').optional().trim(),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('category').optional().isIn(['classic', 'premium', 'vegetarian', 'spicy', 'custom'])
], async (req: Request, res: Response) => {
  try {
    const { search, sort = 'createdAt', order = 'desc', category } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const pizzas = await Pizza.find(query)
      .populate('ingredients')
      .sort({ [sort as string]: sortOrder });

    res.json(pizzas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pizza (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pizza = await Pizza.findById(req.params.id).populate('ingredients');
    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }
    res.json(pizza);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create pizza (admin only)
router.post('/', authenticate, isAdmin, [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('basePrice').isFloat({ min: 0 }),
  body('image').trim().notEmpty(),
  body('ingredients').isArray(),
  body('category').isIn(['classic', 'premium', 'vegetarian', 'spicy', 'custom'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pizza = await Pizza.create(req.body);
    await pizza.populate('ingredients');
    
    res.status(201).json(pizza);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update pizza (admin only)
router.put('/:id', authenticate, isAdmin, [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['classic', 'premium', 'vegetarian', 'spicy', 'custom'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ingredients');

    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }

    res.json(pizza);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pizza (admin only)
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) {
      return res.status(404).json({ error: 'Pizza not found' });
    }
    res.json({ message: 'Pizza deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


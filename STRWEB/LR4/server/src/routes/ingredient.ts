import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import Ingredient from '../models/Ingredient';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all ingredients (public - with search and sort)
router.get('/', [
  query('search').optional().trim(),
  query('sort').optional().isIn(['name', 'price', 'category']),
  query('order').optional().isIn(['asc', 'desc']),
  query('category').optional().isIn(['cheese', 'meat', 'vegetables', 'sauce', 'spices', 'other'])
], async (req: Request, res: Response) => {
  try {
    const { search, sort = 'name', order = 'asc', category } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const ingredients = await Ingredient.find(query).sort({ [sort as string]: sortOrder });

    res.json(ingredients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ingredient (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create ingredient (admin only)
router.post('/', authenticate, isAdmin, [
  body('name').trim().notEmpty(),
  body('category').isIn(['cheese', 'meat', 'vegetables', 'sauce', 'spices', 'other']),
  body('price').isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ingredient = await Ingredient.create(req.body);
    res.status(201).json(ingredient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update ingredient (admin only)
router.put('/:id', authenticate, isAdmin, [
  body('name').optional().trim().notEmpty(),
  body('category').optional().isIn(['cheese', 'meat', 'vegetables', 'sauce', 'spices', 'other']),
  body('price').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete ingredient (admin only)
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


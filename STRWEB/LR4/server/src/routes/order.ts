import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import Order from '../models/Order';
import Pizza from '../models/Pizza';
import Ingredient from '../models/Ingredient';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all orders (authenticated users see their own, admins see all)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sort = 'createdAt', order = 'desc', status } = req.query;
    const query: any = {};

    if (req.user?.role !== 'admin') {
      query.user = req.user?._id;
    }

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.pizza')
      .populate('items.customIngredients')
      .sort({ [sort as string]: sortOrder });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.pizza')
      .populate('items.customIngredients');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Users can only see their own orders (unless admin)
    if (req.user?.role !== 'admin' && order.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create order (authenticated)
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }),
  body('items.*.pizza').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('deliveryAddress').trim().notEmpty()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, deliveryAddress } = req.body;
    let totalPrice = 0;

    // Calculate total price and validate items
    for (const item of items) {
      const pizza = await Pizza.findById(item.pizza);
      if (!pizza) {
        return res.status(400).json({ error: `Pizza ${item.pizza} not found` });
      }

      let itemPrice = pizza.basePrice;
      
      // Add custom ingredients price
      if (item.customIngredients && item.customIngredients.length > 0) {
        const ingredients = await Ingredient.find({ _id: { $in: item.customIngredients } });
        itemPrice += ingredients.reduce((sum, ing) => sum + ing.price, 0);
      }

      totalPrice += itemPrice * item.quantity;
    }

    const order = await Order.create({
      user: req.user!._id,
      items,
      totalPrice,
      deliveryAddress
    });

    await order.populate('items.pizza');
    await order.populate('items.customIngredients');

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (authenticated - users can cancel, admins can update)
router.patch('/:id/status', authenticate, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'packaging', 'delivering', 'delivered', 'cancelled'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Users can only cancel their own orders
    if (req.user?.role !== 'admin') {
      if (order.user.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (req.body.status !== 'cancelled') {
        return res.status(403).json({ error: 'Only cancellation allowed' });
      }
    }

    order.status = req.body.status;
    await order.save();

    await order.populate('items.pizza');
    await order.populate('items.customIngredients');

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update courier location (admin only)
router.patch('/:id/location', authenticate, [
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 })
], async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { courierLocation: req.body },
      { new: true }
    ).populate('items.pizza');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order (admin can delete any, users can delete their own cancelled orders)
// @ts-ignore - Express middleware type compatibility issue
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Admin can delete any order
    if (req.user?.role === 'admin') {
      await Order.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Order deleted successfully' });
    }

    // Regular users can only delete their own cancelled orders
    if (order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'cancelled') {
      return res.status(403).json({ error: 'Only cancelled orders can be deleted' });
    }
    
    if (order.status !== 'delivering') {
      return res.status(403).json({ error: 'Only cancelled orders can be deleted' });
    }
    if (order.status !== 'deleverd') {
      return res.status(403).json({ error: 'Only cancelled orders can be deleted' });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


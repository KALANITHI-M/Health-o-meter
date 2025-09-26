import express from 'express';
import { body, validationResult } from 'express-validator';
import FoodLog from '../models/FoodLog.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's food logs
router.get('/', async (req, res) => {
  try {
    const foodLogs = await FoodLog.find({ userId: req.user.userId })
      .sort({ loggedAt: -1 });

    const formattedLogs = foodLogs.map(log => ({
      id: log._id,
      name: log.foodName,
      meal_type: log.mealType,
      health_score: log.healthScore,
      logged_at: log.loggedAt.toISOString()
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Get food logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new food log
router.post('/', [
  body('foodName').notEmpty().trim(),
  body('mealType').isIn(['morning', 'afternoon', 'evening']),
  body('healthScore').isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const { foodName, mealType, healthScore } = req.body;

    const foodLog = new FoodLog({
      userId: req.user.userId,
      foodName,
      mealType,
      healthScore,
      loggedAt: new Date()
    });

    await foodLog.save();

    res.status(201).json({
      message: 'Food logged successfully',
      foodLog: {
        id: foodLog._id,
        name: foodLog.foodName,
        meal_type: foodLog.mealType,
        health_score: foodLog.healthScore,
        logged_at: foodLog.loggedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Create food log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's food logs
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await FoodLog.find({
      userId: req.user.userId,
      loggedAt: { $gte: today, $lt: tomorrow }
    }).sort({ loggedAt: -1 });

    const formattedLogs = todayLogs.map(log => ({
      id: log._id,
      name: log.foodName,
      meal_type: log.mealType,
      health_score: log.healthScore,
      logged_at: log.loggedAt.toISOString()
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Get today logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete food log
router.delete('/:id', async (req, res) => {
  try {
    const foodLog = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!foodLog) {
      return res.status(404).json({ error: 'Food log not found' });
    }

    res.json({ message: 'Food log deleted successfully' });
  } catch (error) {
    console.error('Delete food log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
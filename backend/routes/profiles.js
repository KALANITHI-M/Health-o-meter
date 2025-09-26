import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName
      },
      avatar_url: user.avatarUrl,
      current_streak: user.currentStreak,
      total_badges: user.totalBadges,
      health_conditions: user.healthConditions,
      dietary_goals: user.dietaryGoals,
      weekly_target: user.weeklyTarget,
      daily_meal_target: user.dailyMealTarget,
      // Onboarding fields
      age: user.age,
      weight_kg: user.weightKg,
      height_cm: user.heightCm,
      activity_level: user.activityLevel,
      goals: user.goals,
      hydration_target_glasses: user.hydrationTargetGlasses,
      hydration_progress_glasses: user.hydrationProgressGlasses,
      points: user.points,
      level: user.level,
      avatar_state: user.avatarState
      ,
      fatigue: user.fatigue,
      last_sleep_hours: user.lastSleepHours,
      last_workout_minutes: user.lastWorkoutMinutes,
      last_workout_type: user.lastWorkoutType
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/', [
  body('firstName').optional().notEmpty(),
  body('lastName').optional(),
  body('currentStreak').optional().isInt({ min: 0 }),
  body('totalBadges').optional().isInt({ min: 0 }),
  body('healthConditions').optional().isArray(),
  body('dietaryGoals').optional(),
  body('weeklyTarget').optional().isInt({ min: 0, max: 100 }),
  body('dailyMealTarget').optional().isInt({ min: 1, max: 6 }),
  // Onboarding fields
  body('age').optional().isInt({ min: 1, max: 120 }),
  body('weightKg').optional().isFloat({ min: 1, max: 1000 }),
  body('heightCm').optional().isFloat({ min: 30, max: 300 }),
  body('activityLevel').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  body('goals').optional().isArray(),
  body('hydrationTargetGlasses').optional().isInt({ min: 1, max: 20 }),
  body('hydrationProgressGlasses').optional().isInt({ min: 0, max: 20 }),
  body('points').optional().isInt({ min: 0 }),
  body('level').optional().isIn(['beginner', 'intermediate', 'pro']),
  body('avatarState').optional().isIn(['happy', 'neutral', 'sad'])
  ,
  body('fatigue').optional().isInt({ min: 0, max: 50 }),
  body('lastSleepHours').optional().isFloat({ min: 0, max: 24 }),
  body('lastWorkoutMinutes').optional().isInt({ min: 0, max: 300 }),
  body('lastWorkoutType').optional().isIn(['walk', 'run', 'strength', 'yoga', 'cycling', 'none'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const updateFields = {};
    const allowedFields = [
      'firstName', 'lastName', 'avatarUrl', 'currentStreak', 'totalBadges',
      'healthConditions', 'dietaryGoals', 'weeklyTarget', 'dailyMealTarget',
      // Onboarding fields
      'age', 'weightKg', 'heightCm', 'activityLevel', 'goals',
      'hydrationTargetGlasses', 'hydrationProgressGlasses', 'points', 'level', 'avatarState'
      , 'fatigue', 'lastSleepHours', 'lastWorkoutMinutes', 'lastWorkoutType'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName
        },
        avatar_url: user.avatarUrl,
        current_streak: user.currentStreak,
        total_badges: user.totalBadges,
        health_conditions: user.healthConditions,
        dietary_goals: user.dietaryGoals,
        weekly_target: user.weeklyTarget,
        daily_meal_target: user.dailyMealTarget,
        age: user.age,
        weight_kg: user.weightKg,
        height_cm: user.heightCm,
        activity_level: user.activityLevel,
        goals: user.goals,
        hydration_target_glasses: user.hydrationTargetGlasses,
        hydration_progress_glasses: user.hydrationProgressGlasses,
        points: user.points,
        level: user.level,
        avatar_state: user.avatarState,
        fatigue: user.fatigue,
        last_sleep_hours: user.lastSleepHours,
        last_workout_minutes: user.lastWorkoutMinutes,
        last_workout_type: user.lastWorkoutType
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update streak and badges (for game mechanics)
router.patch('/progress', [
  body('currentStreak').optional().isInt({ min: 0 }),
  body('totalBadges').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const updateFields = {};
    if (req.body.currentStreak !== undefined) {
      updateFields.currentStreak = req.body.currentStreak;
    }
    if (req.body.totalBadges !== undefined) {
      updateFields.totalBadges = req.body.totalBadges;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Progress updated successfully',
      current_streak: user.currentStreak,
      total_badges: user.totalBadges
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
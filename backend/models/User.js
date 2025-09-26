import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  avatarUrl: {
    type: String
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  totalBadges: {
    type: Number,
    default: 0
  },
  healthConditions: [{
    type: String
  }],
  dietaryGoals: {
    type: String
  },
  weeklyTarget: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  dailyMealTarget: {
    type: Number,
    default: 3,
    min: 1,
    max: 6
  },
  // Onboarding & profile extensions
  age: { type: Number, min: 1, max: 120 },
  weightKg: { type: Number, min: 1, max: 1000 },
  heightCm: { type: Number, min: 30, max: 300 },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], default: 'light' },
  goals: [{ type: String }], // e.g., ['weight_loss', 'muscle_gain', 'healthy_lifestyle']
  hydrationTargetGlasses: { type: Number, default: 8, min: 1, max: 20 },
  hydrationProgressGlasses: { type: Number, default: 0, min: 0, max: 20 },
  points: { type: Number, default: 0, min: 0 },
  level: { type: String, enum: ['beginner', 'intermediate', 'pro'], default: 'beginner' },
  avatarState: { type: String, enum: ['happy', 'neutral', 'sad'], default: 'neutral' }
  ,
  // Recovery & effort tracking
  fatigue: { type: Number, default: 10, min: 0, max: 50 },
  lastSleepHours: { type: Number, min: 0, max: 24 },
  lastWorkoutMinutes: { type: Number, min: 0, max: 300 },
  lastWorkoutType: { type: String, enum: ['walk', 'run', 'strength', 'yoga', 'cycling', 'none'], default: 'none' }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
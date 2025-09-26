import mongoose from 'mongoose';

const foodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening']
  },
  foodName: {
    type: String,
    required: true
  },
  healthScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
foodLogSchema.index({ userId: 1, loggedAt: -1 });

export default mongoose.model('FoodLog', foodLogSchema);
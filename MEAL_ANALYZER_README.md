# 📸 Meal Analyzer Feature

## Overview
The Meal Analyzer is an AI-powered feature that analyzes food photos to provide instant nutritional feedback and suggestions for balanced eating.

## Features
- **Photo Upload**: Users can upload meal photos (PNG, JPG, GIF up to 10MB)
- **AI Analysis**: Uses Google's Gemini 2.0 Flash for food recognition and analysis
- **Smart Verdicts**: Color-coded results (✅ Balanced, ⚠️ Needs Improvement, ❌ Unbalanced)
- **Actionable Suggestions**: 2-3 practical tips for meal improvement
- **Retry Logic**: Automatic retries with exponential backoff for reliability

## How It Works
1. Users navigate to the "Meal Analyzer" tab
2. Upload a clear photo of their meal
3. AI analyzes nutritional balance, portion sizes, and food groups
4. Receive instant feedback with improvement suggestions
5. Reset and analyze another meal

## Technical Details

### API Integration
- **Service**: Google Gemini 2.0 Flash API
- **Model**: `gemini-2.0-flash-exp`
- **Response Format**: Structured JSON with analysis, verdict, and suggestions
- **Rate Limiting**: Built-in retry logic with exponential backoff

### Components
- **MealAnalyzer.tsx**: Main component with upload, analysis, and results
- **SideNavigation.tsx**: Updated with new "Meal Analyzer" tab
- **Index.tsx**: Routes the meal analyzer tab to the component

### Environment Variables
```env
VITE_GEMINI_API_KEY="your-gemini-api-key-here"
```

### UI/UX Features
- **Responsive Design**: Works on desktop and mobile
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Visual indicators during AI analysis
- **Error Handling**: User-friendly error messages
- **Image Preview**: Full preview of uploaded photos

## Usage Guidelines
- **Best Results**: Clear, well-lit photos work best
- **File Limits**: Maximum 10MB file size
- **Supported Formats**: PNG, JPG, GIF
- **Analysis Time**: Usually 2-5 seconds per image

## Integration with Health-o-Meter
- Seamlessly integrated with existing navigation
- Consistent with app's health-focused design theme
- Uses existing UI components (cards, buttons, alerts)
- Follows the app's color scheme and typography

## Future Enhancements
- Integration with food logging system
- Calorie estimation
- Macro nutrient breakdown
- Meal history tracking
- Personalized recommendations based on health goals
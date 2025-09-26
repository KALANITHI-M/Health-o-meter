// Natural language processing helpers for meal logging

interface ProcessedMeal {
  foodName: string;
  mealType: 'morning' | 'afternoon' | 'evening' | null;
  timeIndicator: boolean; // Whether time was mentioned in the input
}

/**
 * Analyzes a natural language input about a meal and extracts structured information
 * @param input The user's natural language input about their meal
 */
export function processMealInput(input: string): ProcessedMeal {
  const lowerInput = input.toLowerCase();
  let mealType: 'morning' | 'afternoon' | 'evening' | null = null;
  let timeIndicator = false;
  
  // Check for meal time indicators
  if (
    lowerInput.includes('breakfast') || 
    lowerInput.includes('in the morning') || 
    lowerInput.includes('for breakfast') ||
    lowerInput.includes('morning meal')
  ) {
    mealType = 'morning';
    timeIndicator = true;
  } else if (
    lowerInput.includes('lunch') || 
    lowerInput.includes('in the afternoon') || 
    lowerInput.includes('for lunch') ||
    lowerInput.includes('afternoon meal') ||
    lowerInput.includes('noon')
  ) {
    mealType = 'afternoon';
    timeIndicator = true;
  } else if (
    lowerInput.includes('dinner') || 
    lowerInput.includes('in the evening') || 
    lowerInput.includes('for dinner') ||
    lowerInput.includes('evening meal') ||
    lowerInput.includes('at night') ||
    lowerInput.includes('supper')
  ) {
    mealType = 'evening';
    timeIndicator = true;
  }
  
  // Extract the food name by removing common phrases
  let foodName = input
    .replace(/I ate/i, '')
    .replace(/I had/i, '')
    .replace(/I consumed/i, '')
    .replace(/for breakfast/i, '')
    .replace(/for lunch/i, '')
    .replace(/for dinner/i, '')
    .replace(/for my breakfast/i, '')
    .replace(/for my lunch/i, '')
    .replace(/for my dinner/i, '')
    .replace(/in the morning/i, '')
    .replace(/in the afternoon/i, '')
    .replace(/in the evening/i, '')
    .replace(/at night/i, '')
    .replace(/today/i, '')
    .replace(/yesterday/i, '')
    .trim();
  
  return {
    foodName,
    mealType,
    timeIndicator
  };
}

/**
 * Cleans up and normalizes food names for better health score calculation
 * @param foodName Raw food name input
 */
export function normalizeFoodName(foodName: string): string {
  return foodName
    .replace(/^\s*and\s+/, '') // Remove leading "and"
    .replace(/^\s*some\s+/, '') // Remove leading "some"
    .replace(/^\s*a\s+/, '') // Remove leading "a"
    .replace(/^\s*an\s+/, '') // Remove leading "an"
    .replace(/\s+$/, '') // Trim trailing spaces
    .trim();
}
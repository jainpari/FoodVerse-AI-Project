import {
  UserProfile,
  FoodIntakeItem,
  AnalysisHistoryItem,
} from '../types/foodverse';

const STORAGE_KEY_PROFILE = 'foodverse_user_profile';
const STORAGE_KEY_INTAKE = 'foodverse_food_intake';
const STORAGE_KEY_HISTORY = 'foodverse_analysis_history';
const STORAGE_KEY_WATER = 'foodverse_daily_water';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@foodverse.ai',
  age: 28,
  gender: 'Female',
  heightCm: 172,
  weightKg: 64,
  activityLevel: 'Moderate (3-5 days/wk)',
  goal: 'Lean Muscle Gain',
  dietaryPreference: 'Omnivore',
  allergies: ['Peanuts (Mild)'],
  targetDailyCalories: 2150,
  waterTargetLiters: 2.8,
  useMetric: true,
};

export const INITIAL_INTAKE_ITEMS: FoodIntakeItem[] = [
  {
    id: 'intake-1',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    title: 'Avocado & Poached Egg Sourdough Toast',
    mealType: 'Breakfast',
    calories: 420,
    protein: 18,
    carbs: 38,
    fat: 22,
  },
  {
    id: 'intake-2',
    timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    title: 'Grilled Salmon Quinoa Bowl with Spinach',
    mealType: 'Lunch',
    calories: 520,
    protein: 38,
    carbs: 42,
    fat: 23,
  },
];

export const INITIAL_HISTORY_ITEMS: AnalysisHistoryItem[] = [
  {
    id: 'hist-1',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    type: 'recognition',
    title: 'Grilled Salmon Quinoa Bowl',
    subtitle: '520 kcal • 38g Protein • Mediterranean',
    scoreOrCalorie: '520 kcal',
    badge: 'Health Score: 92',
    imageThumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    data: {
      dishName: 'Grilled Salmon Quinoa Bowl',
      calories: 520,
      healthScore: 92,
      cuisine: 'Mediterranean',
    },
  },
  {
    id: 'hist-2',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    type: 'freshness',
    title: 'Cavendish Bananas Assessment',
    subtitle: 'Ripening with sugar freckles • 1-2 days room shelf-life',
    scoreOrCalorie: 'Score: 68/100',
    badge: 'Possibly Aging',
    imageThumbnail: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
    data: {
      productName: 'Cavendish Bananas',
      freshnessStatus: 'Possibly Aging',
      freshnessScore: 68,
    },
  },
  {
    id: 'hist-3',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    type: 'hygiene',
    title: 'Commercial Cold Prep Line Audit',
    subtitle: 'Score 82/100 • 4 Positive • 2 Areas of Attention',
    scoreOrCalorie: 'Score: 82/100',
    badge: 'Moderate Attention',
    imageThumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80',
    data: {
      assessmentTitle: 'Commercial Cold Prep Line Audit',
      overallHygieneScore: 82,
      overallRiskLevel: 'Moderate Attention',
    },
  },
];

// Profile
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile', e);
  }
}

// Intake
export function loadIntakeItems(): FoodIntakeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTAKE);
    if (!raw) return INITIAL_INTAKE_ITEMS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INTAKE_ITEMS;
  }
}

export function saveIntakeItems(items: FoodIntakeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INTAKE, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving food intake', e);
  }
}

export function addIntakeItem(item: Omit<FoodIntakeItem, 'id' | 'timestamp'>): FoodIntakeItem {
  const newItem: FoodIntakeItem = {
    ...item,
    id: 'intake-' + Date.now(),
    timestamp: new Date().toISOString(),
  };
  const current = loadIntakeItems();
  const updated = [newItem, ...current];
  saveIntakeItems(updated);
  return newItem;
}

// Daily Water
export function loadDailyWater(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WATER);
    return raw ? parseFloat(raw) : 1.75;
  } catch (e) {
    return 1.75;
  }
}

export function saveDailyWater(liters: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_WATER, liters.toFixed(2));
  } catch (e) {
    console.error('Error saving water intake', e);
  }
}

// History
export function loadHistoryItems(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return INITIAL_HISTORY_ITEMS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_HISTORY_ITEMS;
  }
}

export function saveHistoryItems(items: AnalysisHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving analysis history', e);
  }
}

export function addHistoryItem(item: Omit<AnalysisHistoryItem, 'id' | 'timestamp'>): AnalysisHistoryItem {
  const newItem: AnalysisHistoryItem = {
    ...item,
    id: 'hist-' + Date.now(),
    timestamp: new Date().toISOString(),
  };
  const current = loadHistoryItems();
  const updated = [newItem, ...current];
  saveHistoryItems(updated);
  return newItem;
}

export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEY_HISTORY);
}

import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface FoodLog {
  id: string;
  name: string;
  meal_type: 'morning' | 'afternoon' | 'evening';
  health_score: number;
  logged_at: string;
}

export interface Profile {
  user_metadata: {
    first_name: string;
    last_name?: string;
  };
  avatar_url?: string;
  current_streak: number;
  total_badges: number;
  health_conditions: string[];
  dietary_goals?: string;
  weekly_target: number;
  daily_meal_target: number;
  // Onboarding and hydration fields from backend
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals?: string[];
  hydration_target_glasses?: number;
  hydration_progress_glasses?: number;
  points?: number;
  level?: 'beginner' | 'intermediate' | 'pro';
  avatar_state?: 'happy' | 'neutral' | 'sad';
}

export const authAPI = {
  register: (email: string, password: string, firstName: string, lastName?: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, firstName, lastName }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
};

export const foodLogAPI = {
  getAll: () => api.get<FoodLog[]>('/foodlogs'),

  getToday: () => api.get<FoodLog[]>('/foodlogs/today'),

  create: (foodName: string, mealType: 'morning' | 'afternoon' | 'evening', healthScore: number) =>
    api.post('/foodlogs', { foodName, mealType, healthScore }),

  delete: (id: string) => api.delete(`/foodlogs/${id}`),
};

export const profileAPI = {
  get: () => api.get<Profile>('/profiles'),

  update: (data: Partial<Profile>) => api.put('/profiles', data),

  updateProgress: (currentStreak: number, totalBadges: number) =>
    api.patch('/profiles/progress', { currentStreak, totalBadges }),
};

export const aiAPI = {
  suggest: (params: { energy: number; xp: number; fatigue: number; hydrationPercent?: number; recent?: any }) =>
    api.post<{ text: string }>('/ai/suggest', params),
};

export default api;
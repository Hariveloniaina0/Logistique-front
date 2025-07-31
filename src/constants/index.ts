export * from './colors';

export const APP_CONFIG = {
  APP_NAME: 'StoreManager',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  USER_DATA: '@user_data',
  THEME_PREFERENCE: '@theme_preference',
} as const;
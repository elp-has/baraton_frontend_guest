// Environment configuration for deployment
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // API configuration
  railway: {
    url: import.meta.env.VITE_RAILWAY_API_URL,
    apiKey: import.meta.env.VITE_RAILWAY_API_KEY,
    projectId: import.meta.env.VITE_RAILWAY_PROJECT_ID,
  },

  // App configuration
  app: {
    name: 'Baraton Oasis Hotel',
    version: '1.0.0',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    maxRoomsPerType: 50,
    maxBookingAmount: 10000000, // 100,000 KES in kobo
    minBookingAmount: 100 // 1 KES in kobo
  },

  // Feature flags
  features: {
    enableRealTimeUpdates: true,
    enableImageUpload: true,
    enableAdvancedAnalytics: false
  }
};
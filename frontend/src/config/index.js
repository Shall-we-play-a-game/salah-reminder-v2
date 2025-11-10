export const config = {
  api: {
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
  },
  app: {
    name: 'Salah Reminder',
    version: '1.0.0',
    description: 'Never miss a prayer',
  },
  storage: {
    keys: {
      user: 'user',
      theme: 'darkMode',
      ringtone: 'ringtone',
      alarms: (mosqueId) => `alarms_${mosqueId}`,
    },
  },
  theme: {
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#059669',
    },
  },
};

export default config;
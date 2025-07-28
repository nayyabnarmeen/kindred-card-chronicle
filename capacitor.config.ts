import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8b4c1792d479419b8737a661d5d76849',
  appName: 'kindred-card-chronicle',
  webDir: 'dist',
  server: {
    url: 'https://8b4c1792-d479-419b-8737-a661d5d76849.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
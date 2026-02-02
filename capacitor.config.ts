import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tibetan.app',
  appName: 'Tibetan App',
  webDir: 'out',
  server: {
    url: 'http://10.0.2.2:3000', // Points to localhost from Android Emulator
    cleartext: true
  }
};

export default config;

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mn.gevabal.buddha',
  appName: 'Gevabal',
  webDir: 'out',

  server: {
    // Production: Use your actual domain
    // Development: Use local IP for testing on devices
    url: process.env.NODE_ENV === 'production'
      ? 'https://gevabal.mn'
      : undefined,
    cleartext: process.env.NODE_ENV !== 'production',
    androidScheme: 'https',
    iosScheme: 'https',
  },

  // iOS-specific optimizations
  ios: {
    contentInset: 'automatic',
    // Enable WKWebView optimizations
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
    limitsNavigationsToAppBoundDomains: true,
  },

  // Android-specific optimizations
  android: {
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
    },
    // Enable hardware acceleration
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FAFAF9',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#D97706',
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAFAF9',
      overlaysWebView: false,
    },

    Keyboard: {
      resize: 'native',
      style: 'LIGHT',
      resizeOnFullScreen: true,
    },

    // Performance: Limit concurrent HTTP requests
    CapacitorHttp: {
      enabled: true,
    },

    // Preferences for caching
    Preferences: {
      group: 'mn.gevabal.buddha.preferences',
    },

    // App-specific optimizations
    App: {
      // Handle app state changes efficiently
      disableBackButtonHandler: false,
    },
  },

  // Performance optimizations
  cordova: {
    preferences: {
      ScrollEnabled: 'true',
      BackupWebStorage: 'local',
      // Disable unnecessary features
      DisallowOverscroll: 'true',
      EnableViewportScale: 'false',
      KeyboardDisplayRequiresUserAction: 'true',
      SuppressesIncrementalRendering: 'false',
      // Performance
      CordovaWebViewEngine: 'CDVWKWebViewEngine',
      WKWebViewOnly: 'true',
      // Security
      AllowInlineMediaPlayback: 'false',
    },
  },
};

export default config;

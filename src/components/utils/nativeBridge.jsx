/**
 * Native Bridge for Capacitor Integration
 * Handles communication between React frontend and native device hardware
 * Provides safe fallbacks for web browsers
 */

// Lazy load Capacitor modules to avoid build errors in web-only mode
let Capacitor, PushNotifications, Network, Device, Preferences, SplashScreen, StatusBar, Style;

const loadCapacitorModules = async () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    const capacitorCore = await import('@capacitor/core');
    Capacitor = capacitorCore.Capacitor;
    
    const pushModule = await import('@capacitor/push-notifications');
    PushNotifications = pushModule.PushNotifications;
    
    const networkModule = await import('@capacitor/network');
    Network = networkModule.Network;
    
    const deviceModule = await import('@capacitor/device');
    Device = deviceModule.Device;
    
    const prefsModule = await import('@capacitor/preferences');
    Preferences = prefsModule.Preferences;
    
    const splashModule = await import('@capacitor/splash-screen');
    SplashScreen = splashModule.SplashScreen;
    
    const statusModule = await import('@capacitor/status-bar');
    StatusBar = statusModule.StatusBar;
    Style = statusModule.Style;
  }
};

// ============================================
// PLATFORM DETECTION
// ============================================

export const isNative = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();
};

export const getPlatform = () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor.getPlatform();
  }
  return 'web';
};

// ============================================
// NETWORK STATUS
// ============================================

export const networkBridge = {
  // Get current network status
  getStatus: async () => {
    if (isNative()) {
      return await Network.getStatus();
    }
    // Web fallback
    return { connected: navigator.onLine, connectionType: 'wifi' };
  },

  // Add listener for network changes
  addListener: (callback) => {
    if (isNative()) {
      const listener = Network.addListener('networkStatusChange', callback);
      return () => listener.remove();
    }
    // Web fallback
    const handleOnline = () => callback({ connected: true });
    const handleOffline = () => callback({ connected: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
};

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export const pushBridge = {
  // Request permissions
  requestPermissions: async () => {
    if (!isNative()) {
      console.log('Push notifications only available on native platforms');
      return { receive: 'denied' };
    }

    try {
      const result = await PushNotifications.requestPermissions();
      return result;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { receive: 'denied' };
    }
  },

  // Register for push notifications
  register: async () => {
    if (!isNative()) {
      console.log('Push registration only available on native platforms');
      return null;
    }

    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering for push:', error);
    }
  },

  // Get device token
  addRegistrationListener: (callback) => {
    if (!isNative()) return () => {};

    const listener = PushNotifications.addListener('registration', callback);
    return () => listener.remove();
  },

  // Handle registration errors
  addRegistrationErrorListener: (callback) => {
    if (!isNative()) return () => {};

    const listener = PushNotifications.addListener('registrationError', callback);
    return () => listener.remove();
  },

  // Handle received notifications
  addNotificationListener: (callback) => {
    if (!isNative()) return () => {};

    const listener = PushNotifications.addListener('pushNotificationReceived', callback);
    return () => listener.remove();
  },

  // Handle notification taps
  addActionListener: (callback) => {
    if (!isNative()) return () => {};

    const listener = PushNotifications.addListener('pushNotificationActionPerformed', callback);
    return () => listener.remove();
  },

  // Schedule local notification (for medication reminders)
  scheduleLocal: async (notification) => {
    if (!isNative()) {
      // Web fallback - use Web Notifications API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/icon-192.png'
        });
      }
      return;
    }

    try {
      await PushNotifications.schedule({
        notifications: [notification]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
};

// ============================================
// DEVICE INFORMATION
// ============================================

export const deviceBridge = {
  // Get device ID (for 2FA)
  getId: async () => {
    if (!isNative()) {
      // Web fallback - generate/retrieve from localStorage
      let deviceId = localStorage.getItem('web_device_id');
      if (!deviceId) {
        deviceId = 'web_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('web_device_id', deviceId);
      }
      return { identifier: deviceId };
    }

    try {
      const info = await Device.getId();
      return info;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return { identifier: 'unknown' };
    }
  },

  // Get device info
  getInfo: async () => {
    if (!isNative()) {
      return {
        platform: 'web',
        model: navigator.userAgent,
        operatingSystem: 'web',
        osVersion: 'unknown',
        manufacturer: 'unknown',
        isVirtual: false,
        webViewVersion: 'N/A'
      };
    }

    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  }
};

// ============================================
// PREFERENCES (Secure Storage)
// ============================================

export const storageeBridge = {
  // Set a value
  set: async (key, value) => {
    if (!isNative()) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }

    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error setting preference:', error);
    }
  },

  // Get a value
  get: async (key) => {
    if (!isNative()) {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }

    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting preference:', error);
      return null;
    }
  },

  // Remove a value
  remove: async (key) => {
    if (!isNative()) {
      localStorage.removeItem(key);
      return;
    }

    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing preference:', error);
    }
  }
};

// ============================================
// APP INITIALIZATION
// ============================================

export const initializeApp = async () => {
  if (!isNative()) {
    console.log('Running in web mode - native features disabled');
    return;
  }

  try {
    // Load Capacitor modules
    await loadCapacitorModules();

    // Hide splash screen
    if (SplashScreen) {
      await SplashScreen.hide();
    }

    // Configure status bar (iOS/Android)
    if ((getPlatform() === 'ios' || getPlatform() === 'android') && StatusBar && Style) {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#00BCD4' });
    }

    console.log('✅ Native app initialized');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

// ============================================
// ALERT BRIDGE (Native vs Web)
// ============================================

export const alertBridge = {
  // Show native alert
  show: async (title, message) => {
    if (isNative()) {
      // Use push notification for native
      await pushBridge.scheduleLocal({
        title,
        body: message,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 100) }
      });
    } else {
      // Web fallback - use browser alert or custom UI
      alert(`${title}\n\n${message}`);
    }
  }
};

// Export all bridges
export default {
  isNative,
  getPlatform,
  networkBridge,
  pushBridge,
  deviceBridge,
  storageBridge: storageeBridge,
  initializeApp,
  alertBridge
};
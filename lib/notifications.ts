// Browser notifications utility
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications or running server-side');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  public async showNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
    } = {}
  ): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    try {
      const notification = new Notification(title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        ...options
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }

  // Predefined notification types for Yatri Rakshak
  public async showEmergencyAlert(message: string, data?: any) {
    return this.showNotification('🚨 Emergency Alert', {
      body: message,
      tag: 'emergency',
      requireInteraction: true,
      data
    });
  }

  public async showSafetyAlert(title: string, message: string, severity: 'info' | 'warning' | 'danger') {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      danger: '🚨'
    };

    return this.showNotification(`${icons[severity]} ${title}`, {
      body: message,
      tag: 'safety-alert',
      requireInteraction: severity === 'danger',
      data: { severity }
    });
  }

  public async showLocationAlert(message: string) {
    return this.showNotification('📍 Location Update', {
      body: message,
      tag: 'location',
      data: { type: 'location' }
    });
  }

  public async showWeatherAlert(title: string, message: string) {
    return this.showNotification(`🌤️ ${title}`, {
      body: message,
      tag: 'weather',
      data: { type: 'weather' }
    });
  }

  public async showIncidentResponse(message: string, incidentId: string) {
    return this.showNotification('✅ Incident Update', {
      body: message,
      tag: 'incident-response',
      data: { incidentId }
    });
  }

  // Service Worker notifications (for when app is in background)
  public static async showServiceWorkerNotification(
    title: string,
    options: NotificationOptions = {}
  ) {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

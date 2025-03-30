export type NetworkStatus = 'online' | 'offline' | 'unknown';

class NetworkManager {
  private static instance: NetworkManager;
  private status: NetworkStatus = 'unknown';
  private listeners: Array<(status: NetworkStatus) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.status = navigator.onLine ? 'online' : 'offline';
      
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private handleOnline = () => {
    this.setStatus('online');
  };

  private handleOffline = () => {
    this.setStatus('offline');
  };

  private setStatus(newStatus: NetworkStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  public addStatusChangeListener(callback: (status: NetworkStatus) => void) {
    this.listeners.push(callback);
    callback(this.status);
    return () => this.removeStatusChangeListener(callback);
  }

  public removeStatusChangeListener(callback: (status: NetworkStatus) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  public getStatus(): NetworkStatus {
    return this.status;
  }

  public cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners = [];
  }
}

export const networkManager = NetworkManager.getInstance();

export function useNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  
  const [status, setStatus] = useState<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );

  useEffect(() => {
    const cleanup = networkManager.addStatusChangeListener(setStatus);
    return cleanup;
  }, []);

  return status;
}

import { useState, useEffect } from 'react'; 
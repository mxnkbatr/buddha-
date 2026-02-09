/**
 * Mobile Network Optimization
 * Handles API request optimization, batching, and offline queue
 */

import { Capacitor } from '@capacitor/core';
import type { ConnectionStatus } from '@capacitor/network';

interface QueuedRequest {
    url: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
    retry: number;
    timestamp: number;
}

class NetworkOptimizer {
    private requestQueue: QueuedRequest[] = [];
    private isOnline: boolean = true;
    private maxRetries = 3;
    private batchDelay = 100; // ms to wait before batching
    private pendingBatch: any[] = [];
    private batchTimeout?: any;

    constructor() {
        this.initNetworkListener();
    }

    /**
     * Initialize network status listener
     */
    private async initNetworkListener() {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const { Network } = await import('@capacitor/network');

            // Check initial status
            const status = await Network.getStatus();
            this.isOnline = status.connected;

            // Listen for changes
            Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
                this.isOnline = status.connected;

                if (this.isOnline) {
                    console.log('🌐 Network restored, processing queue...');
                    this.processQueue();
                } else {
                    console.log('📴 Network lost, queueing requests...');
                }
            });
        } catch (error) {
            console.warn('Network plugin not available:', error);
        }
    }

    /**
     * Optimized fetch with offline queue
     */
    async fetch(
        url: string,
        options: RequestInit = {}
    ): Promise<Response> {
        // If offline, queue the request
        if (!this.isOnline) {
            return this.queueRequest(url, options);
        }

        try {
            const response = await fetch(url, options);

            // If request failed due to network, queue it
            if (!response.ok && response.status === 0) {
                return this.queueRequest(url, options);
            }

            return response;
        } catch (error) {
            // Network error, queue the request
            console.warn('Network error, queueing request:', error);
            return this.queueRequest(url, options);
        }
    }

    /**
     * Queue a request for later
     */
    private queueRequest(
        url: string,
        options: RequestInit
    ): Promise<Response> {
        const queuedRequest: QueuedRequest = {
            url,
            method: options.method || 'GET',
            body: options.body,
            headers: options.headers as Record<string, string>,
            retry: 0,
            timestamp: Date.now(),
        };

        this.requestQueue.push(queuedRequest);

        // Save to storage for persistence
        if (Capacitor.isNativePlatform()) {
            this.saveQueueToStorage();
        }

        // Return a pending promise (will resolve when processed)
        return Promise.reject(
            new Error('Request queued for offline processing')
        );
    }

    /**
     * Process queued requests when online
     */
    private async processQueue() {
        if (!this.isOnline || this.requestQueue.length === 0) return;

        const queue = [...this.requestQueue];
        this.requestQueue = [];

        for (const request of queue) {
            try {
                await fetch(request.url, {
                    method: request.method,
                    body: request.body,
                    headers: request.headers,
                });
                console.log('✅ Queued request processed:', request.url);
            } catch (error) {
                // Retry logic
                if (request.retry < this.maxRetries) {
                    request.retry++;
                    this.requestQueue.push(request);
                } else {
                    console.error('❌ Request failed after retries:', request.url);
                }
            }
        }

        // Save updated queue
        if (Capacitor.isNativePlatform()) {
            this.saveQueueToStorage();
        }
    }

    /**
     * Batch multiple requests together
     */
    async batchRequest(requests: any[]): Promise<any[]> {
        this.pendingBatch.push(...requests);

        // Clear existing timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }

        // Wait for more requests, then send batch
        return new Promise((resolve) => {
            this.batchTimeout = setTimeout(async () => {
                const batch = [...this.pendingBatch];
                this.pendingBatch = [];

                try {
                    // Send as single request
                    const response = await this.fetch('/api/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requests: batch }),
                    });

                    const results = await response.json();
                    resolve(results);
                } catch (error) {
                    console.error('Batch request failed:', error);
                    resolve([]);
                }
            }, this.batchDelay);
        });
    }

    /**
     * Save queue to persistent storage
     */
    private async saveQueueToStorage() {
        try {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({
                key: 'network_queue',
                value: JSON.stringify(this.requestQueue),
            });
        } catch (error) {
            console.error('Failed to save queue:', error);
        }
    }

    /**
     * Load queue from storage on app start
     */
    async loadQueueFromStorage() {
        try {
            const { Preferences } = await import('@capacitor/preferences');
            const { value } = await Preferences.get({ key: 'network_queue' });

            if (value) {
                this.requestQueue = JSON.parse(value);
                console.log('📥 Loaded queued requests:', this.requestQueue.length);

                // Process if online
                if (this.isOnline) {
                    this.processQueue();
                }
            }
        } catch (error) {
            console.error('Failed to load queue:', error);
        }
    }

    /**
     * Get network status
     */
    getNetworkStatus(): boolean {
        return this.isOnline;
    }

    /**
     * Clear all queued requests
     */
    clearQueue(): void {
        this.requestQueue = [];
        if (Capacitor.isNativePlatform()) {
            this.saveQueueToStorage();
        }
    }
}

// Singleton instance
export const networkOptimizer = new NetworkOptimizer();

// Initialize queue loading
if (typeof window !== 'undefined') {
    networkOptimizer.loadQueueFromStorage();
}

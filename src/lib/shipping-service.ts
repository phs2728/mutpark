import { prisma } from './prisma';

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';
  estimatedDelivery?: string;
  currentLocation?: string;
  events: TrackingEvent[];
  lastUpdated: string;
}

export interface ShippingRate {
  providerId: number;
  serviceName: string;
  cost: number;
  estimatedDays: number;
  currency: string;
}

export class ShippingService {
  // PTT Kargo API Integration
  async trackPTTPackage(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // PTT Kargo API simulation - replace with actual API call
      const mockData: TrackingInfo = {
        trackingNumber,
        status: 'IN_TRANSIT',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: 'İstanbul Anadolu Yakası Dağıtım Merkezi',
        events: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'PICKED_UP',
            location: 'İstanbul Merkez',
            description: 'Kargo teslim alındı'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'IN_TRANSIT',
            location: 'İstanbul Anadolu Yakası',
            description: 'Transfer merkezine ulaştı'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      return mockData;
    } catch (error) {
      console.error('PTT tracking error:', error);
      return null;
    }
  }

  // Yurtiçi Kargo API Integration
  async trackYurticiPackage(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // Yurtiçi Kargo API simulation - replace with actual API call
      const mockData: TrackingInfo = {
        trackingNumber,
        status: 'OUT_FOR_DELIVERY',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: 'Ankara Şubesi',
        events: [
          {
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            status: 'PICKED_UP',
            location: 'İstanbul Şubesi',
            description: 'Gönderim teslim alındı'
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'IN_TRANSIT',
            location: 'Ankara Aktarma Merkezi',
            description: 'Aktarma merkezine ulaştı'
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'OUT_FOR_DELIVERY',
            location: 'Ankara Şubesi',
            description: 'Dağıtıma çıktı'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      return mockData;
    } catch (error) {
      console.error('Yurtiçi tracking error:', error);
      return null;
    }
  }

  // Aras Kargo API Integration
  async trackArasPackage(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // Aras Kargo API simulation - replace with actual API call
      const mockData: TrackingInfo = {
        trackingNumber,
        status: 'DELIVERED',
        estimatedDelivery: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        currentLocation: 'Teslim Edildi',
        events: [
          {
            timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
            status: 'PICKED_UP',
            location: 'İzmir Merkez',
            description: 'Kargo alındı'
          },
          {
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            status: 'IN_TRANSIT',
            location: 'Ankara Hub',
            description: 'Hub merkezine ulaştı'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'OUT_FOR_DELIVERY',
            location: 'Ankara Çankaya',
            description: 'Kurye ile dağıtıma çıktı'
          },
          {
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'DELIVERED',
            location: 'Teslimat Adresi',
            description: 'Alıcıya teslim edildi'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      return mockData;
    } catch (error) {
      console.error('Aras tracking error:', error);
      return null;
    }
  }

  // MNG Kargo API Integration
  async trackMNGPackage(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      // MNG Kargo API simulation - replace with actual API call
      const mockData: TrackingInfo = {
        trackingNumber,
        status: 'FAILED',
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        currentLocation: 'Şube',
        events: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'PICKED_UP',
            location: 'Bursa Merkez',
            description: 'Gönderi teslim alındı'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'IN_TRANSIT',
            location: 'İstanbul Transfer',
            description: 'Transfer merkezine geldi'
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'FAILED',
            location: 'İstanbul Şube',
            description: 'Teslimat başarısız - Alıcı bulunamadı'
          }
        ],
        lastUpdated: new Date().toISOString()
      };

      return mockData;
    } catch (error) {
      console.error('MNG tracking error:', error);
      return null;
    }
  }

  // Generic tracking method that routes to appropriate provider
  async trackPackage(trackingNumber: string, providerId?: number): Promise<TrackingInfo | null> {
    try {
      let provider;

      if (providerId) {
        provider = await prisma.shippingProvider.findUnique({
          where: { id: providerId }
        });
      } else {
        // Try to detect provider from tracking number format
        provider = await this.detectProviderFromTrackingNumber(trackingNumber);
      }

      if (!provider) {
        console.error('Provider not found for tracking number:', trackingNumber);
        return null;
      }

      // Route to appropriate tracking method based on provider code
      switch (provider.code.toUpperCase()) {
        case 'PTT':
          return await this.trackPTTPackage(trackingNumber);
        case 'YURTICI':
          return await this.trackYurticiPackage(trackingNumber);
        case 'ARAS':
          return await this.trackArasPackage(trackingNumber);
        case 'MNG':
          return await this.trackMNGPackage(trackingNumber);
        default:
          console.error('Unsupported provider code:', provider.code);
          return null;
      }
    } catch (error) {
      console.error('Tracking error:', error);
      return null;
    }
  }

  // Update shipping tracking in database
  async updateShippingTracking(orderId: number, trackingData: TrackingInfo): Promise<void> {
    try {
      await prisma.shippingTracking.upsert({
        where: { orderId },
        create: {
          orderId,
          providerId: 1, // Default to first provider, should be determined properly
          trackingNumber: trackingData.trackingNumber,
          status: trackingData.status,
          currentLocation: trackingData.currentLocation,
          estimatedDelivery: trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery) : null,
          events: trackingData.events,
          lastChecked: new Date(),
        },
        update: {
          status: trackingData.status,
          currentLocation: trackingData.currentLocation,
          estimatedDelivery: trackingData.estimatedDelivery ? new Date(trackingData.estimatedDelivery) : null,
          events: trackingData.events,
          lastChecked: new Date(),
        }
      });
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  // Calculate shipping rates
  async calculateShippingRates(
    weight: number,
    dimensions: { length: number; width: number; height: number },
    origin: string,
    destination: string
  ): Promise<ShippingRate[]> {
    try {
      const providers = await prisma.shippingProvider.findMany({
        where: { status: 'ACTIVE' }
      });

      const rates: ShippingRate[] = [];

      for (const provider of providers) {
        // Basic rate calculation - in real implementation, this would call provider APIs
        let cost = Number(provider.baseRate);

        if (provider.weightRate) {
          cost += weight * Number(provider.weightRate);
        }

        // Add dimension-based pricing (simplified)
        const volumeWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
        if (volumeWeight > weight) {
          cost += (volumeWeight - weight) * 2;
        }

        // Estimate delivery days based on provider
        let estimatedDays = 3;
        switch (provider.code.toUpperCase()) {
          case 'PTT':
            estimatedDays = 2;
            break;
          case 'YURTICI':
            estimatedDays = 1;
            cost *= 1.2; // Premium pricing
            break;
          case 'ARAS':
            estimatedDays = 2;
            break;
          case 'MNG':
            estimatedDays = 3;
            cost *= 0.9; // Economy pricing
            break;
        }

        rates.push({
          providerId: provider.id,
          serviceName: provider.name,
          cost: Math.round(cost * 100) / 100,
          estimatedDays,
          currency: 'TRY'
        });
      }

      return rates.sort((a, b) => a.cost - b.cost);
    } catch (error) {
      console.error('Rate calculation error:', error);
      return [];
    }
  }

  // Detect provider from tracking number pattern
  private async detectProviderFromTrackingNumber(trackingNumber: string): Promise<any> {
    const patterns = [
      { code: 'PTT', pattern: /^[A-Z]{2}\d{9}[A-Z]{2}$/ },
      { code: 'YURTICI', pattern: /^\d{10,12}$/ },
      { code: 'ARAS', pattern: /^[A-Z]\d{10}$/ },
      { code: 'MNG', pattern: /^\d{13}$/ },
    ];

    for (const { code, pattern } of patterns) {
      if (pattern.test(trackingNumber)) {
        return await prisma.shippingProvider.findFirst({
          where: { code }
        });
      }
    }

    return null;
  }

  // Bulk tracking update for all active shipments
  async updateAllShipments(): Promise<{ updated: number; failed: number }> {
    try {
      const activeShipments = await prisma.shippingTracking.findMany({
        where: {
          status: {
            notIn: ['DELIVERED', 'FAILED', 'RETURNED']
          }
        },
        include: {
          provider: true
        }
      });

      let updated = 0;
      let failed = 0;

      for (const shipment of activeShipments) {
        try {
          const trackingInfo = await this.trackPackage(
            shipment.trackingNumber,
            shipment.providerId
          );

          if (trackingInfo) {
            await this.updateShippingTracking(shipment.orderId, trackingInfo);
            updated++;
          } else {
            failed++;
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to update shipment ${shipment.trackingNumber}:`, error);
          failed++;
        }
      }

      return { updated, failed };
    } catch (error) {
      console.error('Bulk update error:', error);
      return { updated: 0, failed: 0 };
    }
  }
}

export const shippingService = new ShippingService();
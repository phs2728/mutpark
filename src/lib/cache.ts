// Simple in-memory cache for development
// In production, you would want to use Redis or similar

interface CacheItem<T> {
  data: T;
  expires: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private maxSize = 1000;

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // Clean up if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const expires = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expires });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const keys = Array.from(this.cache.keys());
      const toRemove = keys.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(key => this.cache.delete(key));
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const cache = new SimpleCache();

// Cache utility functions
export const cacheUtils = {
  // Product caching
  async getProducts(key: string, fetcher: () => Promise<unknown>, ttl: number = 300) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
  },

  // User-specific caching
  async getUser(userId: number, fetcher: () => Promise<unknown>, ttl: number = 600) {
    const key = `user:${userId}`;
    return this.getProducts(key, fetcher, ttl);
  },

  // Recommendations caching
  async getRecommendations(userId: number | null, fetcher: () => Promise<unknown>, ttl: number = 1800) {
    const key = userId ? `recommendations:${userId}` : 'recommendations:anonymous';
    return this.getProducts(key, fetcher, ttl);
  },

  // Recipe caching
  async getRecipes(key: string, fetcher: () => Promise<unknown>, ttl: number = 900) {
    return this.getProducts(key, fetcher, ttl);
  },

  // Invalidate user-related cache
  invalidateUser(userId: number) {
    cache.delete(`user:${userId}`);
    cache.delete(`recommendations:${userId}`);
    // Invalidate any other user-specific caches
  },

  // Invalidate product-related cache
  invalidateProducts() {
    // In a real implementation, you'd want more granular invalidation
    cache.clear();
  },

  // Get cache stats
  getStats() {
    return {
      size: cache.size(),
      maxSize: 1000,
    };
  },

  // Manual cache operations
  set: cache.set.bind(cache),
  get: cache.get.bind(cache),
  delete: cache.delete.bind(cache),
  clear: cache.clear.bind(cache),
};

// For production Redis implementation
/* eslint-disable @typescript-eslint/no-explicit-any */
export class RedisCache {
  private client: unknown; // Redis client

  constructor(redisClient: unknown) {
    this.client = redisClient;
  }

  async set(key: string, data: unknown, ttlSeconds: number = 300): Promise<void> {
    await (this.client as any).setex(key, ttlSeconds, JSON.stringify(data));
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await (this.client as any).get(key);
    return result ? JSON.parse(result) : null;
  }

  async delete(key: string): Promise<void> {
    await (this.client as any).del(key);
  }

  async clear(): Promise<void> {
    await (this.client as any).flushall();
  }
}

// Cache keys generator
export const cacheKeys = {
  products: (page: number, filters: Record<string, unknown>) => `products:${page}:${JSON.stringify(filters)}`,
  product: (id: number) => `product:${id}`,
  user: (id: number) => `user:${id}`,
  recommendations: (userId: number | null) => userId ? `recommendations:${userId}` : 'recommendations:anonymous',
  recipes: (page: number, filters: Record<string, unknown>) => `recipes:${page}:${JSON.stringify(filters)}`,
  recipe: (slug: string) => `recipe:${slug}`,
  cart: (userId: number) => `cart:${userId}`,
  orders: (userId: number, page: number) => `orders:${userId}:${page}`,
};

export default cacheUtils;
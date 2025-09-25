import { useState, useEffect, useCallback } from 'react';

export interface BookmarkItem {
  id: string;
  type: 'product' | 'recipe' | 'post';
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  data: any; // Full data object for offline access
  bookmarkedAt: number;
  tags?: string[];
}

interface UseOfflineBookmarksOptions {
  maxItems?: number;
  storageKey?: string;
  syncOnline?: boolean;
}

export function useOfflineBookmarks(options: UseOfflineBookmarksOptions = {}) {
  const {
    maxItems = 100,
    storageKey = 'mutpark_offline_bookmarks',
    syncOnline = true,
  } = options;

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);

  // Load bookmarks from localStorage
  const loadBookmarks = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarks(parsed.bookmarks || []);
        setLastSync(parsed.lastSync || null);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save bookmarks to localStorage
  const saveBookmarks = useCallback((newBookmarks: BookmarkItem[]) => {
    try {
      const data = {
        bookmarks: newBookmarks.slice(0, maxItems), // Limit to maxItems
        lastSync: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setLastSync(data.lastSync);
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }, [storageKey, maxItems]);

  // Add bookmark
  const addBookmark = useCallback((item: Omit<BookmarkItem, 'bookmarkedAt'>) => {
    const newBookmark: BookmarkItem = {
      ...item,
      bookmarkedAt: Date.now(),
    };

    setBookmarks(prev => {
      // Remove existing bookmark with same id if exists
      const filtered = prev.filter(bookmark => bookmark.id !== item.id);
      const newBookmarks = [newBookmark, ...filtered];
      saveBookmarks(newBookmarks);
      return newBookmarks;
    });

    return newBookmark;
  }, [saveBookmarks]);

  // Remove bookmark
  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.filter(bookmark => bookmark.id !== id);
      saveBookmarks(newBookmarks);
      return newBookmarks;
    });
  }, [saveBookmarks]);

  // Check if item is bookmarked
  const isBookmarked = useCallback((id: string) => {
    return bookmarks.some(bookmark => bookmark.id === id);
  }, [bookmarks]);

  // Get bookmark by id
  const getBookmark = useCallback((id: string) => {
    return bookmarks.find(bookmark => bookmark.id === id);
  }, [bookmarks]);

  // Toggle bookmark
  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'bookmarkedAt'>) => {
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
      return false;
    } else {
      addBookmark(item);
      return true;
    }
  }, [isBookmarked, removeBookmark, addBookmark]);

  // Filter bookmarks by type
  const getBookmarksByType = useCallback((type: BookmarkItem['type']) => {
    return bookmarks.filter(bookmark => bookmark.type === type);
  }, [bookmarks]);

  // Search bookmarks
  const searchBookmarks = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowercaseQuery) ||
      bookmark.description?.toLowerCase().includes(lowercaseQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [bookmarks]);

  // Clear all bookmarks
  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    localStorage.removeItem(storageKey);
    setLastSync(null);
  }, [storageKey]);

  // Export bookmarks
  const exportBookmarks = useCallback(() => {
    const data = {
      bookmarks,
      exportedAt: Date.now(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  }, [bookmarks]);

  // Import bookmarks
  const importBookmarks = useCallback((jsonData: string, merge = false) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        const importedBookmarks = data.bookmarks as BookmarkItem[];

        if (merge) {
          // Merge with existing bookmarks, removing duplicates
          const existingIds = new Set(bookmarks.map(b => b.id));
          const newBookmarks = importedBookmarks.filter(b => !existingIds.has(b.id));
          const mergedBookmarks = [...bookmarks, ...newBookmarks];
          setBookmarks(mergedBookmarks);
          saveBookmarks(mergedBookmarks);
        } else {
          // Replace all bookmarks
          setBookmarks(importedBookmarks);
          saveBookmarks(importedBookmarks);
        }

        return true;
      }
    } catch (error) {
      console.error('Failed to import bookmarks:', error);
    }
    return false;
  }, [bookmarks, saveBookmarks]);

  // Sync with server (if user is logged in)
  const syncWithServer = useCallback(async () => {
    if (!syncOnline) return;

    try {
      // Check if user is authenticated
      const response = await fetch('/api/user/profile');
      if (!response.ok) return; // User not logged in

      // Upload bookmarks to server
      await fetch('/api/user/bookmarks/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarks,
          lastSync,
        }),
      });

      setLastSync(Date.now());
    } catch (error) {
      console.error('Failed to sync bookmarks:', error);
    }
  }, [bookmarks, lastSync, syncOnline]);

  // Get offline data for bookmarked item
  const getOfflineData = useCallback((id: string) => {
    const bookmark = getBookmark(id);
    return bookmark?.data;
  }, [getBookmark]);

  // Check if item data is available offline
  const isAvailableOffline = useCallback((id: string) => {
    const bookmark = getBookmark(id);
    return bookmark && bookmark.data && Object.keys(bookmark.data).length > 0;
  }, [getBookmark]);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Sync with server periodically (if online)
  useEffect(() => {
    if (!syncOnline) return;

    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        syncWithServer();
      }
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => clearInterval(syncInterval);
  }, [syncWithServer, syncOnline]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (syncOnline) {
        syncWithServer();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncWithServer, syncOnline]);

  return {
    bookmarks,
    isLoading,
    lastSync,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmark,
    getBookmarksByType,
    searchBookmarks,
    clearBookmarks,
    exportBookmarks,
    importBookmarks,
    syncWithServer,
    getOfflineData,
    isAvailableOffline,
  };
}

// Hook for managing offline recipe data
export function useOfflineRecipes() {
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getOfflineData,
    isAvailableOffline,
    ...rest
  } = useOfflineBookmarks({
    storageKey: 'mutpark_offline_recipes',
    maxItems: 50,
  });

  const recipes = bookmarks.filter(bookmark => bookmark.type === 'recipe');

  const saveRecipeForOffline = useCallback(async (recipeId: string, recipeData: any) => {
    const bookmark: Omit<BookmarkItem, 'bookmarkedAt'> = {
      id: recipeId,
      type: 'recipe',
      title: recipeData.title,
      description: recipeData.description,
      imageUrl: recipeData.image,
      url: `/recipes/${recipeId}`,
      data: recipeData,
      tags: recipeData.tags || [],
    };

    return addBookmark(bookmark);
  }, [addBookmark]);

  return {
    recipes,
    saveRecipeForOffline,
    removeRecipe: removeBookmark,
    isRecipeSaved: isBookmarked,
    getRecipeData: getOfflineData,
    isRecipeAvailableOffline: isAvailableOffline,
    ...rest,
  };
}

// Hook for managing offline product data
export function useOfflineProducts() {
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    getOfflineData,
    isAvailableOffline,
    ...rest
  } = useOfflineBookmarks({
    storageKey: 'mutpark_offline_products',
    maxItems: 30,
  });

  const products = bookmarks.filter(bookmark => bookmark.type === 'product');

  const saveProductForOffline = useCallback(async (productId: string, productData: any) => {
    const bookmark: Omit<BookmarkItem, 'bookmarkedAt'> = {
      id: productId,
      type: 'product',
      title: productData.name,
      description: productData.description,
      imageUrl: productData.images?.[0],
      url: `/products/${productId}`,
      data: productData,
      tags: productData.tags || [],
    };

    return addBookmark(bookmark);
  }, [addBookmark]);

  return {
    products,
    saveProductForOffline,
    removeProduct: removeBookmark,
    isProductSaved: isBookmarked,
    getProductData: getOfflineData,
    isProductAvailableOffline: isAvailableOffline,
    ...rest,
  };
}
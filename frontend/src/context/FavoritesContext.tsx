import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { RealProduct } from '../services/productApi';

// Favorite item interface
export interface FavoriteItem {
  id: string;
  product: RealProduct;
  addedAt: string;
  category?: string;
  tags?: string[];
}

// Favorites state interface
interface FavoritesState {
  items: FavoriteItem[];
  totalItems: number;
  lastUpdated: string;
  categories: string[];
}

// Action types
type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: { product: RealProduct } }
  | { type: 'REMOVE_FAVORITE'; payload: { productId: string } }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteItem[] };

// Initial state
const initialState: FavoritesState = {
  items: [],
  totalItems: 0,
  lastUpdated: new Date().toISOString(),
  categories: []
};

// Favorites reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_FAVORITE': {
      const { product } = action.payload;
      
      // Check if product is already in favorites
      const existingIndex = state.items.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        return state; // Product already in favorites
      }

      const newItem: FavoriteItem = {
        id: `fav_${product.id}_${Date.now()}`,
        product,
        addedAt: new Date().toISOString(),
        category: product.category,
        tags: (product as any).tags || []
      };

      const newItems = [...state.items, newItem];
      const categories = Array.from(new Set(newItems.map(item => item.category).filter(Boolean))) as string[];

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        categories,
        lastUpdated: new Date().toISOString()
      };
    }

    case 'REMOVE_FAVORITE': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const categories = Array.from(new Set(newItems.map(item => item.category).filter(Boolean))) as string[];

      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        categories,
        lastUpdated: new Date().toISOString()
      };
    }

    case 'CLEAR_FAVORITES':
      return {
        ...state,
        items: [],
        totalItems: 0,
        categories: [],
        lastUpdated: new Date().toISOString()
      };

    case 'LOAD_FAVORITES': {
      const items = action.payload;
      const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[];

      return {
        ...state,
        items,
        totalItems: items.length,
        categories,
        lastUpdated: new Date().toISOString()
      };
    }

    default:
      return state;
  }
};

// Context interface
interface FavoritesContextType {
  state: FavoritesState;
  addFavorite: (product: RealProduct) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  isFavorite: (productId: string) => boolean;
  getFavorite: (productId: string) => FavoriteItem | undefined;
  getFavoritesByCategory: (category: string) => FavoriteItem[];
  toggleFavorite: (product: RealProduct) => boolean; // Returns true if added, false if removed
}

// Create context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Local storage key
const FAVORITES_STORAGE_KEY = 'social_commerce_favorites';

// Favorites provider component
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        const favoriteItems = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: favoriteItems });
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [state.items]);

  // Action handlers
  const addFavorite = (product: RealProduct) => {
    dispatch({ type: 'ADD_FAVORITE', payload: { product } });
  };

  const removeFavorite = (productId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: { productId } });
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const isFavorite = (productId: string): boolean => {
    return state.items.some(item => item.product.id === productId);
  };

  const getFavorite = (productId: string): FavoriteItem | undefined => {
    return state.items.find(item => item.product.id === productId);
  };

  const getFavoritesByCategory = (category: string): FavoriteItem[] => {
    return state.items.filter(item => item.category === category);
  };

  const toggleFavorite = (product: RealProduct): boolean => {
    const isCurrentlyFavorite = isFavorite(product.id);
    if (isCurrentlyFavorite) {
      removeFavorite(product.id);
      return false; // Removed
    } else {
      addFavorite(product);
      return true; // Added
    }
  };

  const value: FavoritesContextType = {
    state,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
    getFavorite,
    getFavoritesByCategory,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Favorites utilities
export const favoritesUtils = {
  exportFavorites: (items: FavoriteItem[]): string => {
    return JSON.stringify(items, null, 2);
  },

  importFavorites: (jsonData: string): FavoriteItem[] => {
    try {
      return JSON.parse(jsonData);
    } catch (error) {
      throw new Error('Invalid favorites data format');
    }
  },

  getMostPopularCategories: (items: FavoriteItem[]): string[] => {
    const categoryCount = items.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category)
      .slice(0, 5);
  },

  getRecommendedProducts: (items: FavoriteItem[]): string[] => {
    // Get categories of favorited items for recommendations
    const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[];
    return categories.slice(0, 3);
  }
};

export default FavoritesContext;
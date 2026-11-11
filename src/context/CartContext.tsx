"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FoodItem, CartItem } from "@/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: FoodItem, quantity?: number) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  removeUnavailableItems: () => void;
  syncCartWithMenu: () => Promise<void>;
  hasUnavailableItems: boolean;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  specialNotes: string;
  setSpecialNotes: (notes: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "upahar_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const syncCartWithMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu?includeInactive=true");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data?.items) || data.items.length === 0) return;

      const byId = new Map<string, FoodItem>();
      const byName = new Map<string, FoodItem>();
      for (const m of data.items as FoodItem[]) {
        byId.set(m.id, m);
        byName.set(m.name.trim().toLowerCase(), m);
      }

      setItems((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;
        const next = prev.map((cartItem) => {
          const matched =
            byId.get(cartItem.foodItem.id) ||
            byName.get(cartItem.foodItem.name.trim().toLowerCase());
          if (!matched) return cartItem;

          if (
            matched.price !== cartItem.foodItem.price ||
            matched.isAvailable !== cartItem.foodItem.isAvailable ||
            matched.name !== cartItem.foodItem.name ||
            matched.id !== cartItem.foodItem.id
          ) {
            changed = true;
            return {
              ...cartItem,
              foodItem: {
                ...cartItem.foodItem,
                id: matched.id,
                name: matched.name,
                price: matched.price,
                isAvailable: matched.isAvailable,
                image: matched.image || cartItem.foodItem.image,
                portionSize: matched.portionSize ?? cartItem.foodItem.portionSize,
              },
            };
          }
          return cartItem;
        });
        return changed ? next : prev;
      });
    } catch {
      // Keep existing local cart silently on offline transient errors
    }
  }, []);

  // Load from localStorage on mount & reconcile live menu prices/availability
  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && active) {
            setItems(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load cart from storage", e);
      } finally {
        if (active) setIsInitialized(true);
      }
      if (active) {
        await syncCartWithMenu();
      }
    });
    return () => {
      active = false;
    };
  }, [syncCartWithMenu]);

  // Cross-tab cart sync via localStorage storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CART_STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Instant SSE updates when Admin/Kitchen changes dish availability or price
  useRealtimeEvents({
    onMenuItemUpdated: (payload) => {
      if (!payload?.itemId) return;
      setItems((prev) =>
        prev.map((cartItem) => {
          if (cartItem.foodItem.id !== payload.itemId) return cartItem;
          return {
            ...cartItem,
            foodItem: {
              ...cartItem.foodItem,
              ...(payload.name ? { name: payload.name } : {}),
              ...(payload.price !== undefined ? { price: Number(payload.price) } : {}),
              isAvailable:
                payload.action === "DELETED"
                  ? false
                  : payload.isAvailable !== undefined
                  ? Boolean(payload.isAvailable)
                  : cartItem.foodItem.isAvailable,
            },
          };
        })
      );
    },
  });

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, [items, isInitialized]);

  const addToCart = (item: FoodItem, quantity = 1) => {
    if (item.isAvailable === false) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.foodItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.foodItem.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { foodItem: item, quantity }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.foodItem.id === itemId) {
            if (delta > 0 && i.foodItem.isAvailable === false) return i;
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.foodItem.id !== itemId));
  };

  const removeUnavailableItems = () => {
    setItems((prev) => prev.filter((i) => i.foodItem.isAvailable !== false));
  };

  const clearCart = () => {
    setItems([]);
    setSpecialNotes("");
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
  };

  const getItemQuantity = (itemId: string) => {
    const found = items.find((i) => i.foodItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const hasUnavailableItems = items.some((i) => i.foodItem.isAvailable === false);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.foodItem.price * item.quantity,
    0
  );

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        removeUnavailableItems,
        syncCartWithMenu,
        hasUnavailableItems,
        clearCart,
        getItemQuantity,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        specialNotes,
        setSpecialNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


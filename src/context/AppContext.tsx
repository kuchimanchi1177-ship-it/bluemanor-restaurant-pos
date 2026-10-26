"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RestaurantBrand,
  Category,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  CartItem,
  Waiter,
  Feedback,
  ToastMessage,
  RestaurantTable,
  TableStatus,
  DemoUser,
  UserRole,
} from '@/types';
import {
  DEFAULT_BRAND,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_WAITERS,
  INITIAL_FEEDBACKS,
  INITIAL_TABLES,
  DEMO_USERS,
} from '@/data/mockData';
import { generateOrderNumber } from '@/utils/formatters';

interface CartMeta {
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  paymentMethod: PaymentMethod;
  waiterName: string;
  notes: string;
}

interface AppContextType {
  // Authentication & Demo User
  currentUser: DemoUser | null;
  isLoggedIn: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;

  // Brand state
  brand: RestaurantBrand;
  updateBrand: (brand: Partial<RestaurantBrand>) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (val: boolean) => void;

  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => boolean;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };

  // Menu items
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'salesCount'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;

  // Tables
  tables: RestaurantTable[];
  updateTable: (table: RestaurantTable) => void;
  assignWaiterToTable: (tableId: string, waiterName: string) => void;
  setTableStatus: (tableId: string, status: TableStatus) => void;
  addTable: (table: Omit<RestaurantTable, 'id'>) => void;
  deleteTable: (tableId: string) => void;
  startPOSForTable: (tableNumber: string) => void;

  // Orders
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => void;

  // POS & Cart
  cart: CartItem[];
  cartMeta: CartMeta;
  setCartMeta: React.Dispatch<React.SetStateAction<CartMeta>>;
  addToCart: (item: MenuItem, qty?: number) => void;
  updateCartQuantity: (menuItemId: string, qty: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  placeOrder: () => Order | null;

  // Waiters
  waiters: Waiter[];
  addWaiter: (waiter: Omit<Waiter, 'id' | 'totalOrders' | 'totalSales'>) => void;
  updateWaiter: (waiter: Waiter) => void;
  deleteWaiter: (id: string) => void;

  // Feedbacks
  feedbacks: Feedback[];
  addFeedback: (fb: Omit<Feedback, 'id' | 'date'>) => void;
  deleteFeedback: (id: string) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Invoice modal
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Reset
  resetDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(DEMO_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Brand state
  const [brand, setBrand] = useState<RestaurantBrand>(DEFAULT_BRAND);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

  // Tables State
  const [tables, setTables] = useState<RestaurantTable[]>(INITIAL_TABLES);

  // Entities
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [waiters, setWaiters] = useState<Waiter[]>(INITIAL_WAITERS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);

  // Navigation - default to Live Orders
  const [activeTab, setActiveTab] = useState<string>('orders');

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartMeta, setCartMeta] = useState<CartMeta>({
    tableNumber: 'T-01',
    customerName: 'Aman Verma',
    customerPhone: '+91 98765 43210',
    orderType: 'Dine-in',
    discountType: 'percentage',
    discountValue: 0,
    paymentMethod: 'UPI / QR',
    waiterName: 'Rahul Sharma',
    notes: '',
  });

  // Invoice Modal
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('restopos_user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedLoggedIn = localStorage.getItem('restopos_logged_in');
      if (storedLoggedIn !== null) {
        setIsLoggedIn(JSON.parse(storedLoggedIn));
      }

      const storedBrand = localStorage.getItem('restopos_brand');
      if (storedBrand) {
        const parsed = JSON.parse(storedBrand);
        if (parsed.name === 'BLUEMANOR') {
          setBrand(parsed);
        } else {
          setBrand(DEFAULT_BRAND);
          // Old brand data in storage, clear old menu/categories
          localStorage.removeItem('restopos_menu');
          localStorage.removeItem('restopos_categories');
          localStorage.removeItem('restopos_orders');
        }
      }

      const storedOnboarded = localStorage.getItem('restopos_onboarded');
      if (storedOnboarded !== null) {
        setIsOnboarded(JSON.parse(storedOnboarded));
      }

      const storedTables = localStorage.getItem('restopos_tables');
      if (storedTables) setTables(JSON.parse(storedTables));

      const storedCategories = localStorage.getItem('restopos_categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(INITIAL_CATEGORIES);
      }

      const storedMenu = localStorage.getItem('restopos_menu');
      if (storedMenu) {
        const parsed: MenuItem[] = JSON.parse(storedMenu);
        setMenuItems(
          parsed.map((item) => {
            const foodType = item.foodType || (item.isVeg ? 'VEG' : 'NON_VEG');
            return {
              ...item,
              foodType,
              isVeg: foodType === 'VEG',
            };
          })
        );
      } else {
        setMenuItems(INITIAL_MENU_ITEMS);
      }

      const storedOrders = localStorage.getItem('restopos_orders');
      if (storedOrders) {
        const parsed: Order[] = JSON.parse(storedOrders);
        setOrders(
          parsed.map((ord) => ({
            ...ord,
            items: (ord.items || []).map((it) => ({
              ...it,
              foodType: it.foodType || 'VEG',
            })),
          }))
        );
      } else {
        setOrders(INITIAL_ORDERS);
      }

      const storedWaiters = localStorage.getItem('restopos_waiters');
      if (storedWaiters) {
        setWaiters(JSON.parse(storedWaiters));
      } else {
        setWaiters(INITIAL_WAITERS);
      }

      const storedFeedbacks = localStorage.getItem('restopos_feedbacks');
      if (storedFeedbacks) {
        setFeedbacks(JSON.parse(storedFeedbacks));
      } else {
        setFeedbacks(INITIAL_FEEDBACKS);
      }
    } catch (e) {
      console.error('Failed to restore demo state from localStorage', e);
    }
    setIsClientLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_user', JSON.stringify(currentUser));
    } catch {}
  }, [currentUser, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_logged_in', JSON.stringify(isLoggedIn));
    } catch {}
  }, [isLoggedIn, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_brand', JSON.stringify(brand));
    } catch {}
  }, [brand, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_onboarded', JSON.stringify(isOnboarded));
    } catch {}
  }, [isOnboarded, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_tables', JSON.stringify(tables));
    } catch {}
  }, [tables, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_categories', JSON.stringify(categories));
    } catch {}
  }, [categories, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_menu', JSON.stringify(menuItems));
    } catch {}
  }, [menuItems, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_orders', JSON.stringify(orders));
    } catch {}
  }, [orders, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_waiters', JSON.stringify(waiters));
    } catch {}
  }, [waiters, isClientLoaded]);

  useEffect(() => {
    if (!isClientLoaded) return;
    try {
      localStorage.setItem('restopos_feedbacks', JSON.stringify(feedbacks));
    } catch {}
  }, [feedbacks, isClientLoaded]);

  // Auth Actions
  const login = (email: string, role?: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const userToSet: DemoUser = matched || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: role || 'Cashier',
      avatar: '👤',
    };
    setCurrentUser(userToSet);
    setIsLoggedIn(true);
    setActiveTab('orders');
    showToast({
      type: 'success',
      title: 'Demo Session Started',
      message: `Signed in as ${userToSet.name} (${userToSet.role}).`,
    });
  };

  const logout = () => {
    setIsLoggedIn(false);
    showToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Demo session ended. Returned to private login gate.',
    });
  };

  // Brand Actions
  const updateBrand = (newDetails: Partial<RestaurantBrand>) => {
    setBrand((prev) => ({ ...prev, ...newDetails }));
    showToast({
      type: 'success',
      title: 'Brand Settings Updated',
      message: 'Restaurant profile and billing details have been updated.',
    });
  };

  // Table Management Actions
  const updateTable = (updated: RestaurantTable) => {
    setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast({
      type: 'success',
      title: 'Table Updated',
      message: `${updated.tableNumber} status set to ${updated.status}.`,
    });
  };

  const assignWaiterToTable = (tableId: string, waiterName: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, assignedWaiterName: waiterName } : t))
    );
    showToast({
      type: 'info',
      title: 'Staff Assigned',
      message: `${waiterName} assigned to table.`,
    });
  };

  const setTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  const addTable = (table: Omit<RestaurantTable, 'id'>) => {
    const newTbl: RestaurantTable = {
      ...table,
      id: `tbl-${Date.now()}`,
    };
    setTables((prev) => [...prev, newTbl]);
    showToast({
      type: 'success',
      title: 'Table Added',
      message: `Table ${table.tableNumber} added to floor plan.`,
    });
  };

  const deleteTable = (tableId: string) => {
    const target = tables.find((t) => t.id === tableId);
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    showToast({
      type: 'info',
      title: 'Table Removed',
      message: target ? `Table ${target.tableNumber} deleted.` : 'Table removed.',
    });
  };

  const startPOSForTable = (tableNumber: string) => {
    const foundTable = tables.find((t) => t.tableNumber === tableNumber);
    setCartMeta((prev) => ({
      ...prev,
      tableNumber,
      orderType: 'Dine-in',
      waiterName: foundTable?.assignedWaiterName || prev.waiterName,
    }));
    setActiveTab('pos');
  };

  // Cart Actions
  const addToCart = (item: MenuItem, qty: number = 1) => {
    if (!item.isAvailable) {
      showToast({
        type: 'warning',
        title: 'Item Unavailable',
        message: `${item.name} is currently marked out of stock.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [...prev, { menuItem: item, quantity: qty }];
    });

    showToast({
      type: 'info',
      title: 'Added to Cart',
      message: `${item.name} (+${qty})`,
    });
  };

  const updateCartQuantity = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === menuItemId ? { ...c, quantity: qty } : c))
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // POS Order Placement
  const placeOrder = (): Order | null => {
    if (cart.length === 0) {
      showToast({
        type: 'error',
        title: 'Cart is Empty',
        message: 'Please add at least one item to place an order.',
      });
      return null;
    }

    if (cartMeta.orderType === 'Dine-in' && !cartMeta.tableNumber) {
      showToast({
        type: 'error',
        title: 'Table Number Required',
        message: 'Please specify a table number for Dine-in orders.',
      });
      return null;
    }

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    let discount = 0;
    if (cartMeta.discountType === 'percentage') {
      discount = Math.round((subtotal * Math.max(0, Math.min(100, cartMeta.discountValue || 0))) / 100);
    } else {
      discount = Math.max(0, Math.min(cartMeta.discountValue || 0, subtotal));
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gstRate = Math.max(0, brand.gstRate || 5);
    const totalTax = (discountedSubtotal * gstRate) / 100;
    const cgst = Math.round((totalTax / 2) * 100) / 100;
    const sgst = Math.round((totalTax / 2) * 100) / 100;
    const grandTotal = Math.round(discountedSubtotal + cgst + sgst);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generateOrderNumber(orders.length),
      customerName: cartMeta.customerName.trim() || 'Guest Customer',
      customerPhone: cartMeta.customerPhone.trim() || '+91 99999 00000',
      tableNumber: cartMeta.orderType === 'Dine-in' ? cartMeta.tableNumber : 'Takeaway',
      orderType: cartMeta.orderType,
      items: cart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
        foodType: c.menuItem.foodType || (c.menuItem.isVeg ? 'VEG' : 'NON_VEG'),
        notes: c.notes,
      })),
      subtotal,
      discount,
      discountPercentage: cartMeta.discountType === 'percentage' ? cartMeta.discountValue : undefined,
      gstRate,
      cgst,
      sgst,
      grandTotal,
      status: 'New',
      createdAt: new Date().toISOString(),
      paymentMethod: cartMeta.paymentMethod,
      paymentStatus: 'Paid',
      waiterName: cartMeta.waiterName || 'Staff',
      notes: cartMeta.notes,
    };

    // Update table status if Dine-in
    if (cartMeta.orderType === 'Dine-in' && cartMeta.tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === cartMeta.tableNumber
            ? {
                ...t,
                status: 'Occupied',
                currentOrderId: newOrder.orderNumber,
                currentBillAmount: grandTotal,
                occupiedSince: 'Just now',
              }
            : t
        )
      );
    }

    // Update waiter stats
    if (cartMeta.waiterName) {
      setWaiters((prev) =>
        prev.map((w) =>
          w.name === cartMeta.waiterName
            ? { ...w, totalOrders: w.totalOrders + 1, totalSales: w.totalSales + grandTotal }
            : w
        )
      );
    }

    // Update item sales counts
    setMenuItems((prev) =>
      prev.map((item) => {
        const found = cart.find((c) => c.menuItem.id === item.id);
        if (found) {
          return { ...item, salesCount: item.salesCount + found.quantity };
        }
        return item;
      })
    );

    // Prepend to orders
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart and reset form notes
    clearCart();
    setCartMeta((prev) => ({ ...prev, notes: '' }));

    // Confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#2563eb', '#10b981', '#f59e0b'],
      });
    } catch {}

    // Show toast
    showToast({
      type: 'success',
      title: 'Order Placed & Bill Generated!',
      message: `${newOrder.orderNumber} for ₹${grandTotal} successfully sent to Live Orders and Kitchen.`,
    });

    // Auto open invoice preview modal
    setSelectedOrderForInvoice(newOrder);
    setIsInvoiceModalOpen(true);

    return newOrder;
  };

  // Order status updates
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    // If served, mark associated table as Billed or Available
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.orderType === 'Dine-in') {
      if (status === 'Served') {
        setTables((prev) =>
          prev.map((t) =>
            t.tableNumber === targetOrder.tableNumber ? { ...t, status: 'Available', currentOrderId: undefined, currentBillAmount: undefined } : t
          )
        );
      }
    }

    showToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order status moved to "${status}".`,
    });
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'Cancelled' as OrderStatus,
              paymentStatus: 'Unpaid',
              notes: reason ? `Cancelled: ${reason}` : ord.notes,
            }
          : ord
      )
    );

    // Free up table if cancelled
    if (targetOrder && targetOrder.orderType === 'Dine-in') {
      setTables((prev) =>
        prev.map((t) =>
          t.tableNumber === targetOrder.tableNumber ? { ...t, status: 'Available', currentOrderId: undefined, currentBillAmount: undefined } : t
        )
      );
    }

    showToast({
      type: 'warning',
      title: 'Order Cancelled',
      message: `The order has been cancelled and marked in order records.`,
    });
  };

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const exists = categories.some(
      (c) => c.name.toLowerCase() === cat.name.trim().toLowerCase()
    );
    if (exists) {
      showToast({
        type: 'error',
        title: 'Category Exists',
        message: `Category "${cat.name}" already exists.`,
      });
      return false;
    }
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast({
      type: 'success',
      title: 'Category Created',
      message: `"${cat.name}" category added successfully.`,
    });
    return true;
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    showToast({
      type: 'success',
      title: 'Category Updated',
      message: `Category details updated.`,
    });
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return { success: false, message: 'Category not found' };

    if (cat.name === 'All') {
      showToast({
        type: 'error',
        title: 'Action Prohibited',
        message: 'The default "All" category cannot be deleted.',
      });
      return { success: false, message: 'Default category cannot be deleted' };
    }

    const itemsCount = menuItems.filter(
      (item) => item.category.toLowerCase() === cat.name.toLowerCase()
    ).length;

    if (itemsCount > 0) {
      showToast({
        type: 'error',
        title: 'Cannot Delete Category',
        message: `There are ${itemsCount} menu items assigned to "${cat.name}". Please reassign or delete them first.`,
      });
      return {
        success: false,
        message: `Category contains ${itemsCount} menu items.`,
      };
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast({
      type: 'info',
      title: 'Category Deleted',
      message: `Category "${cat.name}" has been removed.`,
    });
    return { success: true };
  };

  // Menu Item Actions
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'salesCount'>) => {
    const foodType = item.foodType || (item.isVeg ? 'VEG' : 'NON_VEG');
    const newItem: MenuItem = {
      ...item,
      foodType,
      isVeg: foodType === 'VEG',
      id: `item-${Date.now()}`,
      salesCount: 0,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    showToast({
      type: 'success',
      title: 'Menu Item Added',
      message: `"${item.name}" added to menu catalog and POS.`,
    });
  };

  const updateMenuItem = (item: MenuItem) => {
    const foodType = item.foodType || (item.isVeg ? 'VEG' : 'NON_VEG');
    const updated: MenuItem = {
      ...item,
      foodType,
      isVeg: foodType === 'VEG',
    };
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? updated : m)));
    showToast({
      type: 'success',
      title: 'Menu Item Updated',
      message: `"${item.name}" has been updated.`,
    });
  };

  const deleteMenuItem = (id: string) => {
    const item = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    showToast({
      type: 'info',
      title: 'Menu Item Removed',
      message: item ? `"${item.name}" removed from menu.` : 'Item removed.',
    });
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  // Waiter Actions
  const addWaiter = (waiter: Omit<Waiter, 'id' | 'totalOrders' | 'totalSales'>) => {
    const newWaiter: Waiter = {
      ...waiter,
      id: `waiter-${Date.now()}`,
      totalOrders: 0,
      totalSales: 0,
      joinDate: 'Nov 2024',
    };
    setWaiters((prev) => [...prev, newWaiter]);
    showToast({
      type: 'success',
      title: 'Staff Member Added',
      message: `${waiter.name} added to waitstaff registry.`,
    });
  };

  const updateWaiter = (waiter: Waiter) => {
    setWaiters((prev) => prev.map((w) => (w.id === waiter.id ? waiter : w)));
    showToast({
      type: 'success',
      title: 'Staff Member Updated',
      message: `${waiter.name}'s details saved.`,
    });
  };

  const deleteWaiter = (id: string) => {
    const waiter = waiters.find((w) => w.id === id);
    setWaiters((prev) => prev.filter((w) => w.id !== id));
    showToast({
      type: 'info',
      title: 'Staff Member Removed',
      message: waiter ? `${waiter.name} removed from roster.` : 'Staff member removed.',
    });
  };

  // Feedback Actions
  const addFeedback = (fb: Omit<Feedback, 'id' | 'date'>) => {
    const newFeedback: Feedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      date: 'Just now',
    };
    setFeedbacks((prev) => [newFeedback, ...prev]);
    showToast({
      type: 'success',
      title: 'Customer Review Recorded',
      message: `Feedback from ${fb.customerName} added to analytics.`,
    });
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    showToast({
      type: 'info',
      title: 'Review Deleted',
      message: 'Feedback entry removed.',
    });
  };

  // Reset Demo
  const resetDemo = () => {
    localStorage.clear();
    setBrand(DEFAULT_BRAND);
    setIsOnboarded(true);
    setCurrentUser(DEMO_USERS[0]);
    setIsLoggedIn(true);
    setTables(INITIAL_TABLES);
    setCategories(INITIAL_CATEGORIES);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setWaiters(INITIAL_WAITERS);
    setFeedbacks(INITIAL_FEEDBACKS);
    setCart([]);
    setCartMeta({
      tableNumber: 'T-01',
      customerName: 'Aman Verma',
      customerPhone: '+91 98765 43210',
      orderType: 'Dine-in',
      discountType: 'percentage',
      discountValue: 0,
      paymentMethod: 'UPI / QR',
      waiterName: 'Rahul Sharma',
      notes: '',
    });
    setActiveTab('orders');
    showToast({
      type: 'success',
      title: 'Demo Data Reset',
      message: 'All BLUEMANOR restaurant records restored to pristine defaults.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        login,
        logout,
        brand,
        updateBrand,
        isOnboarded,
        setIsOnboarded,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        tables,
        updateTable,
        assignWaiterToTable,
        setTableStatus,
        addTable,
        deleteTable,
        startPOSForTable,
        orders,
        updateOrderStatus,
        cancelOrder,
        cart,
        cartMeta,
        setCartMeta,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        waiters,
        addWaiter,
        updateWaiter,
        deleteWaiter,
        feedbacks,
        addFeedback,
        deleteFeedback,
        activeTab,
        setActiveTab,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        toasts,
        showToast,
        removeToast,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

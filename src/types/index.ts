export type BusinessType = 'Restaurant' | 'Cafe' | 'Bakery' | 'Hotel' | 'Fast Food';

export type UserRole = 'Owner / Admin' | 'Cashier' | 'Waiter';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  waiterId?: string;
  phone?: string;
}

export interface CreateOrderPayload {
  tableNumber: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    foodType: FoodType;
    notes?: string;
  }[];
  notes?: string;
  waiterName?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'Paid' | 'Unpaid';
  status?: OrderStatus;
  discountPercentage?: number;
}

export interface RestaurantBrand {
  name: string;
  businessType: BusinessType;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  gstin: string;
  gstRate: number; // e.g. 5 for 5%
  storeOpen: boolean;
  currency: string;
}

export type FoodType = 'VEG' | 'NON_VEG';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  foodType: FoodType;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  preparationTime?: string;
  salesCount: number;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  description?: string;
  itemCount?: number;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Billed';
export type TableSection = 'Indoor AC' | 'Outdoor Lawn' | 'First Floor' | 'Family Hall';

export interface RestaurantTable {
  id: string;
  tableNumber: string; // e.g. "T-01"
  capacity: number; // e.g. 4
  status: TableStatus;
  section: TableSection;
  assignedWaiterName?: string;
  currentOrderId?: string;
  currentBillAmount?: number;
  occupiedSince?: string;
}

export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled' | 'Kitchen';
export type OrderType = 'Dine-in' | 'Takeaway';
export type PaymentMethod = 'UPI / QR' | 'Cash' | 'Card';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  foodType: FoodType;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "ORD-1042"
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountPercentage?: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  paymentMethod: PaymentMethod;
  paymentStatus: 'Paid' | 'Unpaid';
  waiterName?: string;
  notes?: string;
}

export interface Waiter {
  id: string;
  name: string;
  role?: string;
  phone: string;
  pin: string;
  status: 'On Duty' | 'Off Duty';
  totalOrders: number;
  totalSales: number;
  assignedTables?: string[];
  avatar?: string;
  joinDate?: string;
}

export interface Feedback {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  tableNumber?: string;
  orderNumber?: string;
  highlightTag?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

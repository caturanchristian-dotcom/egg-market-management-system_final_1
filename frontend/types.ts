/**
 * Access Control Roles
 */
export type UserRole = 'admin' | 'farmer' | 'customer';

/**
 * Platform User Entity
 * Represents any authenticated identity within the system.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string; // 'active' | 'suspended'
  phone?: string;
  address?: string;
  purok?: string; // Local community partition
  latitude?: number;
  longitude?: number;
}

/**
 * Product Classification
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Catalog Item Entity
 * Represents an egg product listing with multi-unit inventory support.
 */
export interface Product {
  id: number;
  farmer_id: number;
  farmer_name?: string; // Denormalized for display performance
  farmer_phone?: string;
  farmer_address?: string;
  farmer_purok?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  name: string;
  egg_type?: string; // e.g., 'Medium', 'Large', 'Extra Large'
  description: string;
  price: number; // Base price per individual egg
  price_per_tray?: number;
  price_per_dozen?: number;
  stock: number; // Raw unit stock
  stock_tray?: number;
  stock_dozen?: number;
  category_id: number;
  category_name?: string;
  image_url: string;
}

/**
 * Transactional Order Entity
 * Represents a customer purchase record.
 */
export interface Order {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_address?: string; // Snapshot at time of order
  customer_purok?: string;
  customer_latitude?: number;
  customer_longitude?: number;
  farmer_id?: number;
  farmer_name?: string;
  farmer_phone?: string;
  farmer_address?: string;
  farmer_purok?: string;
  farmer_latitude?: number;
  farmer_longitude?: number;
  is_reviewed?: number; // Flag for customer feedback
  total_amount: number;
  status: 'pending' | 'processing' | 'on the way' | 'delivered' | 'cancelled';
  created_at: string;
}

/**
 * Order Line Item
 * Breakdown of products inside a single order.
 */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  egg_type?: string;
  quantity: number;
  unit?: 'unit' | 'tray' | 'dozen';
  price: number; // Snapshot price per unit at time of purchase
  price_per_tray?: number;
  price_per_dozen?: number;
  image_url: string;
}

/**
 * Alerting Entity
 */
export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: number; // 0 for unread, 1 for read
  created_at: string;
}

/**
 * Direct Communication Entity
 */
export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: number;
  created_at: string;
}

/**
 * Aggregated Chat View
 */
export interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

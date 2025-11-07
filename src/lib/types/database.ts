export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
export type ProductStatus = 'draft' | 'published' | 'out_of_stock';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

export interface Address {
  id: string;
  user_id: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  status: ProductStatus;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number | null;
  discount_fixed: number | null;
  min_purchase_amount: number | null;
  max_uses: number | null;
  times_used: number;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  status: OrderStatus;
  coupon_id: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_intent_id: string | null;
  payment_status: string | null;
  expected_delivery: string | null;
  tracking_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}
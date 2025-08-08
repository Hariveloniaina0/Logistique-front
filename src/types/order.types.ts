import { User } from "./auth.types";
import { Product } from "./product.types";

export interface Order {
  idOrders: number;
  product: Product;
  user: User;
  ordersQuantity: number;
  status: string;
  ordersDate: Date;
  createdAt: Date;
  warehouseId?: number; 
  storeId?: number;
}

export interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}
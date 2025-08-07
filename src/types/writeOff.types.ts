import { Product } from "./product.types";

// src/types/writeOff.types.ts
export interface WriteOff {
  id: number;
  quantity: number;
  reason: string;
  product: Product;
}
import { Order } from "./order.types";
import { Stock } from "./stock.types";
import { WriteOff } from "./writeOff.types";

// src/types/product.types.ts
export interface Product {
  idProduct: number;
  barcodeValue: string;
  productCode: string;
  productName: string;
  productQuantity: number;
  priceCaisse: number;
  priceGestcom: number;
  stocks?: Stock[];
  orders?: Order[];
  writeOffs?: WriteOff[];
}

export interface ProductState {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: Product[];
  isSearching: boolean;
  selectedProduct: Product | null;
}
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

export interface Stock {
  id: number;
  quantity: number;
  location: string;
  product: Product;
}

export interface Order {
  id: number;
  quantity: number;
  status: string;
  product: Product;
}

export interface WriteOff {
  id: number;
  quantity: number;
  reason: string;
  product: Product;
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
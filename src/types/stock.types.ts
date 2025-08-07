// src/types/stock.types.ts
export interface Stock {
  idStock: number;
  product: {
    idProduct: number;
    productName: string;
    barcodeValue: string;
    productCode: string;
  };
  user: {
    idUser: number;
    email: string;
  };
  supplier?: {
    idSupplier: number;
    supplierName: string;
  };
  warehouse?: {
    idWarehouse: number;
    warehouseName: string;
  };
  store?: {
    idStore: number;
    storeName: string;
  };
  quantity: number;
  changeDate: string;
  createdAt: string;
}

export interface StockFilter {
  productId?: number;
  storeId?: number;
  warehouseId?: number;
}

export interface Store {
  idStore: number;
  storeName: string;
}

export interface Warehouse {
  idWarehouse: number;
  warehouseName: string;
}
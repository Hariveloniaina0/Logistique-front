// src/types/writeOff.types.ts

export type WriteOffType = 'damage' | 'theft' | 'unsold';

export interface WriteOff {
  idWriteOff: number;
  product: {
    idProduct: number;
    productName: string;
    barcodeValue: string;
    productCode: string;
  };
  user: {
    idUser: number;
    userName: string;
  };
  writeOffType: WriteOffType;
  writeOffQuantity: number;
  writeOffComment: string;
  writeOffDate: string;
  createdAt: string;
}

export interface WriteOffExportData {
  barcode: string;
  writeOffType: 'damage' | 'theft' | 'unsold';
  writeOffQuantity: number;
}

export interface WriteOffState {
  writeOffs: WriteOff[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: WriteOff[];
}

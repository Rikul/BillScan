export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface BillData {
  storeName: string;
  date: string; // ISO Date string YYYY-MM-DD
  subtotal: number;
  tax: number;
  total: number;
  lineItems: LineItem[];
  currency?: string;
}

export interface BillRecord extends BillData {
  id: string;
  imageData: string; // Base64 string
  createdAt: string; // ISO Timestamp
}

// Generic storage service interface to enable pluggable backends
export interface IStorageService {
  saveBill(bill: BillRecord): void | Promise<void>;
  getBills(): BillRecord[] | Promise<BillRecord[]>;
  getBillById(id: string): BillRecord | undefined | Promise<BillRecord | undefined>;
  deleteBill(id: string): void | Promise<void>;
}


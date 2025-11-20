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

export type ViewState = 'dashboard' | 'upload' | 'details';

export interface AppState {
  view: ViewState;
  selectedBillId?: string;
}

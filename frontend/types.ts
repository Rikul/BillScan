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
    imagePath: string;
    imageData?: string; // For backward compatibility with old base64-stored records
    createdAt: string; // ISO Timestamp
}

// Generic storage service interface to enable pluggable backends
export interface IStorageService {
    saveBill(bill: BillRecord): Promise<void> | void;
    getBills(): Promise<BillRecord[]> | BillRecord[];
    getBillById(id: string): Promise<BillRecord | undefined> | BillRecord | undefined;
    deleteBill(id: string): Promise<void> | void;
}


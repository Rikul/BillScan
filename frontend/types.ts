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

// Filter parameters for bills query
export interface BillsFilterParams {
    dateFrom?: string;
    dateTo?: string;
    storeName?: string;
    minAmount?: string;
    maxAmount?: string;
    searchTerm?: string;
    page?: number;
    pageSize?: number;
    sortField?: 'date' | 'storeName' | 'total' | 'tax' | 'subtotal';
    sortDirection?: 'asc' | 'desc';
}

// Pagination metadata returned from API
export interface PaginationInfo {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// Response type when pagination is requested
export interface PaginatedBillsResponse {
    bills: BillRecord[];
    pagination: PaginationInfo;
}

// Stats response from the API
export interface StatsResponse {
    total: number;
}

// Generic storage service interface to enable pluggable backends
export interface IStorageService {
    saveBill(bill: BillRecord): Promise<void> | void;
    getBills(params?: BillsFilterParams): Promise<BillRecord[] | PaginatedBillsResponse> | BillRecord[] | PaginatedBillsResponse;
    getBillById(id: string): Promise<BillRecord | undefined> | BillRecord | undefined;
    deleteBill(id: string): Promise<void> | void;
    getStats(params?: BillsFilterParams): Promise<StatsResponse> | StatsResponse;
}

